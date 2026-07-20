import re

with open('lib/initialData.ts', 'r') as f:
    content = f.read()

# Let's add ttdDigital options to one of the approved submissions.
old_val = """    alamatSelamaCuti: 'Perum Geriya Bhakti Praja Blok B-12, Demak',
    status: 'Disetujui',
    berkasPendukung: 'surat_sakit_siti.pdf',"""

new_val = """    alamatSelamaCuti: 'Perum Geriya Bhakti Praja Blok B-12, Demak',
    status: 'Disetujui',
    berkasPendukung: 'surat_sakit_siti.pdf',
    ttdDigitalPemohon: true,
    ttdDigitalAtasan: true,
    ttdDigitalPejabat: true,"""
content = content.replace(old_val, new_val)

with open('lib/initialData.ts', 'w') as f:
    f.write(content)
