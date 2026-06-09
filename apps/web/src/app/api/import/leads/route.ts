import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import Papa from 'papaparse';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

type LeadCsvRow = Record<string, string | undefined>;

const MAX_IMPORT_BYTES = 1024 * 1024;
const MAX_IMPORT_ROWS = 500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeKey(key: string) {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function readCell(row: LeadCsvRow, keys: string[]) {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [normalizeKey(key), value] as const);

  for (const key of keys) {
    const normalizedKey = normalizeKey(key);
    const value = (row[key] ?? normalizedEntries.find(([candidate]) => candidate === normalizedKey)?.[1])?.trim();
    if (value) return value;
  }

  return undefined;
}

function sanitizeText(value: string | undefined, maxLength = 160) {
  const text = value?.replace(/\s+/g, ' ').trim();
  if (!text) return undefined;
  return text.slice(0, maxLength);
}

function normalizeEmail(value: string | undefined) {
  const email = sanitizeText(value, 254)?.toLowerCase();
  if (!email) return null;
  return EMAIL_PATTERN.test(email) ? email : null;
}

function normalizePhone(value: string | undefined) {
  const raw = sanitizeText(value, 32);
  if (!raw) return null;
  const normalized = raw.replace(/(?!^\+)\D/g, '');
  const digits = normalized.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 16) return null;
  return normalized;
}

function leadIdentityKey(phone: string | null, email: string | null) {
  if (phone) return `phone:${phone}`;
  if (email) return `email:${email}`;
  return null;
}

export async function POST(request: Request) {
  try {
    const guard = await protectMutation(request, 'import-leads', { limit: 10, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
    const tenantId = session.activeTenantId;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json({ error: 'CSV file is too large' }, { status: 413 });
    }

    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }

    const text = await file.text();
    const parseResult = Papa.parse<LeadCsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.warn('CSV Parse errors:', parseResult.errors);
    }

    const rows = parseResult.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json({ error: `CSV import is limited to ${MAX_IMPORT_ROWS} rows` }, { status: 413 });
    }

    let importedCount = 0;
    let skippedDuplicate = 0;
    let skippedInvalid = 0;
    const seenIdentities = new Set<string>();
    const sourceCache = new Map<string, string>();

    for (const row of rows) {
      const name = sanitizeText(readCell(row, ['Name', 'Ten', 'Ho Ten', 'Ho va ten']));
      const phone = normalizePhone(readCell(row, ['Phone', 'SDT', 'So dien thoai']));
      const email = normalizeEmail(readCell(row, ['Email']));
      const sourceName = sanitizeText(readCell(row, ['Source', 'Nguon']), 120) || 'CSV Import';
      const identityKey = leadIdentityKey(phone, email);

      if (!name || !identityKey) {
        skippedInvalid++;
        continue;
      }

      if (seenIdentities.has(identityKey)) {
        skippedDuplicate++;
        continue;
      }
      seenIdentities.add(identityKey);

      const duplicateConditions = [
        phone ? { phone } : null,
        email ? { email } : null,
      ].filter(Boolean) as Array<{ phone: string } | { email: string }>;

      const existing = await prisma.lead.findFirst({
        where: { tenantId, deletedAt: null, OR: duplicateConditions },
        select: { id: true },
      });

      if (existing) {
        skippedDuplicate++;
        continue;
      }

      let sourceId = sourceCache.get(sourceName);

      if (!sourceId) {
        const source =
          (await prisma.leadSource.findFirst({
            where: { tenantId, name: sourceName, deletedAt: null },
            select: { id: true },
          })) ??
          (await prisma.leadSource.create({
            data: { tenantId, name: sourceName },
            select: { id: true },
          }));

        sourceId = source.id;
        sourceCache.set(sourceName, sourceId);
      }

      await prisma.lead.create({
        data: {
          tenantId,
          name,
          phone,
          email,
          sourceId,
          stage: 'NEW',
        },
      });
      importedCount++;
    }

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'LEAD_CSV_IMPORTED',
      entityType: 'LeadImport',
      entityId: `csv_${Date.now()}`,
      afterJson: { importedCount, skippedDuplicate, skippedInvalid, totalRows: rows.length, fileName: file.name, fileSize: file.size },
      metadataJson: { source: 'lead_import_api' },
    });

    return NextResponse.json({
      success: true,
      count: importedCount,
      total: rows.length,
      skipped: { duplicate: skippedDuplicate, invalid: skippedInvalid },
    });
  } catch (error) {
    console.error('Import error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 });
  }
}
