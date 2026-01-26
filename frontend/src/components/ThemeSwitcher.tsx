import { useThemeStore, Theme } from '../stores/themeStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SunIcon, MoonIcon, PaletteIcon, CheckIcon } from 'lucide-react';

const themes: { value: Theme; label: string; icon: React.ReactNode; colors: string[] }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <SunIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#3b82f6', '#2563eb', '#10b981'],
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <MoonIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#60a5fa', '#3b82f6', '#34d399'],
  },
  {
    value: 'blue',
    label: 'Ocean Blue',
    icon: <PaletteIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#2563eb', '#1d4ed8', '#0ea5e9'],
  },
  {
    value: 'green',
    label: 'Forest Green',
    icon: <PaletteIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#059669', '#047857', '#10b981'],
  },
  {
    value: 'purple',
    label: 'Royal Purple',
    icon: <PaletteIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#8b5cf6', '#7c3aed', '#a78bfa'],
  },
  {
    value: 'sunset',
    label: 'Sunset Orange',
    icon: <PaletteIcon className="w-5 h-5" strokeWidth={2} />,
    colors: ['#f97316', '#ea580c', '#fb923c'],
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader>
        <CardTitle className="text-h3 text-card-foreground">Appearance</CardTitle>
        <CardDescription className="text-muted-foreground">
          Customize the look and feel of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${theme === themeOption.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-background hover:border-primary/50'
                }
              `}
            >
              {theme === themeOption.value && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {themeOption.icon}
                </div>
                <span className="font-semibold text-foreground">{themeOption.label}</span>
              </div>
              <div className="flex gap-2">
                {themeOption.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

