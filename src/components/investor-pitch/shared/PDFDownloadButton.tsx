import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFDownloadButtonProps {
  url: string;
  label: string;
  variant?: 'default' | 'outline';
}

export const PDFDownloadButton = ({ url, label, variant = 'outline' }: PDFDownloadButtonProps) => {
  return (
    <Button variant={variant} size="lg" asChild>
      <a href={url} download>
        <Download className="h-5 w-5 mr-2" />
        {label}
      </a>
    </Button>
  );
};
