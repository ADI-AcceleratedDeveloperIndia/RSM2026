# Regional Certificate Generation Code

This folder contains all the code responsible for generating, previewing, and downloading Regional Certificates.

## Structure

```
regional-certificate-code/
├── app/
│   └── certificates/
│       ├── regional/          # Regional certificate selection page
│       ├── generate/           # Certificate generation form
│       └── preview/            # Certificate preview and download
├── components/
│   ├── certificates/
│   │   └── Certificate.tsx    # Main certificate component
│   └── ui/                     # UI components (Button, Input, Label, Textarea)
├── lib/
│   ├── regional.ts            # Regional authority data and utilities
│   ├── reference.ts           # Reference ID generation
│   └── utils.ts               # Utility functions (cn, hashIp)
└── utils/
    └── certificateExport.ts   # PDF export functionality
```

## Key Files

### Pages
- **`app/certificates/regional/page.tsx`** - Displays regional authority cards and links to generate/preview certificates
- **`app/certificates/generate/page.tsx`** - Form to input certificate details (supports regional authority via `rta` query param)
- **`app/certificates/preview/page.tsx`** - Preview certificate and download as PDF

### Components
- **`components/certificates/Certificate.tsx`** - Main certificate rendering component (supports regional authority display)

### Utilities
- **`lib/regional.ts`** - Regional authority data structure and lookup function
- **`lib/reference.ts`** - Reference ID generation for certificates
- **`utils/certificateExport.ts`** - Client-side PDF export using html2canvas and jsPDF

## How It Works

1. **Regional Selection** (`/certificates/regional`):
   - Displays all regional authorities
   - Each card has "Generate Regional Certificate" and "Quick preview" links
   - Links include `rta` query parameter to identify the regional authority

2. **Certificate Generation** (`/certificates/generate?rta=karimnagar`):
   - Form accepts certificate details
   - If `rta` query param is present, automatically fills district and shows regional authority info
   - On submit, redirects to preview with all data in URL params

3. **Certificate Preview** (`/certificates/preview?type=ORG&rta=karimnagar&...`):
   - Reads data from URL params
   - If `rta` param exists, fetches regional authority data
   - Renders certificate with regional authority photo/name/title in header
   - Provides download button to export as PDF

## Regional Authority Integration

The certificate component displays up to 3 leadership photos in the header:
1. Chief Minister (always shown)
2. Transport Minister (always shown)
3. Regional Authority (shown if `regionalAuthority` prop is provided)

The regional authority data comes from `lib/regional.ts` and is passed via the `rta` query parameter.

## Dependencies

This code requires:
- Next.js (App Router)
- React Hook Form
- Zod (validation)
- html2canvas (PDF export)
- jsPDF (PDF generation)
- Radix UI components (Button, Label)
- Tailwind CSS
- Next.js Image component
- Lucide React icons

