import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  testId?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'es', name: 'Spanish', rtl: false },
  { code: 'fr', name: 'French', rtl: false },
  { code: 'de', name: 'German', rtl: false },
  { code: 'nl', name: 'Dutch', rtl: false },
  { code: 'pt', name: 'Portuguese', rtl: false },
  { code: 'it', name: 'Italian', rtl: false },
  { code: 'zh', name: 'Chinese (Simplified)', rtl: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', rtl: false },
  { code: 'ar', name: 'Arabic', rtl: true },
  { code: 'fa', name: 'Farsi', rtl: true },
  { code: 'hi', name: 'Hindi', rtl: false },
  { code: 'ru', name: 'Russian', rtl: false },
  { code: 'ja', name: 'Japanese', rtl: false },
  { code: 'ko', name: 'Korean', rtl: false },
];

export function getLanguageRTL(code: string): boolean {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang?.rtl || false;
}

export function getLanguageName(code: string): string {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang?.name ?? code;
}

export default function LanguageSelector({ 
  value, 
  onChange, 
  disabled,
  label = "Translate to",
  testId = "select-language"
}: LanguageSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="language-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id="language-select"
          className="h-11 w-full rounded-lg border-border/80 bg-background/60 shadow-2xs transition-all hover:border-primary/50"
          data-testid={testId}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <SelectValue placeholder="Select language" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
              <span className="flex items-center justify-between w-full gap-3">
                <span>{lang.name}</span>
                <span className="text-[10px] uppercase font-mono text-muted-foreground">{lang.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
