import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { Challenge } from './challenges/types';
import { en, renderBidi } from './lib/bidi';
import type { FlociStatus } from './lib/floci-health';
import { dirOf, useLanguage, type Lang } from './lib/i18n';
import { LanguageToggle } from './tutorial/LanguageToggle';

const UI = {
  he: {
    title: `מעבדת ${en('AWS: S3 + Lambda')}`,
    intro:
      `קונסולת ${en('AWS')} שמחוברת ל-${en('Floci')} — אמולטור ${en('AWS')} שרץ בתוך ה-${en('Codespace')} שלכם. ` +
      `כל מה שתיצרו כאן אמיתי (בקשות ${en('API')} אמיתיות, קונטיינרים אמיתיים ל-${en('Lambda')}), אבל חינמי ולא נוגע בחשבון ${en('AWS')}.`,
    challenges: 'אתגרים',
    start: 'התחילו את האתגר',
    terminal: 'רוצים גם טרמינל?',
    terminalBody: `ה-${en('AWS CLI')} בטרמינל של ה-${en('Codespace')} כבר מכוון ל-${en('Floci')}. נסו:`,
    challenge: (n: number) => `אתגר ${n}`,
  },
  en: {
    title: 'AWS Lab: S3 + Lambda',
    intro:
      'An AWS console wired to Floci — an AWS emulator running inside your Codespace. Everything you create here is real (real API calls, real Lambda containers), but free and nowhere near an AWS account.',
    challenges: 'Challenges',
    start: 'Start challenge',
    terminal: 'Prefer a terminal?',
    terminalBody:
      "The AWS CLI in your Codespace's terminal already points at Floci. Try:",
    challenge: (n: number) => `Challenge ${n}`,
  },
} satisfies Record<Lang, Record<string, unknown>>;

export function HomePage({
  challenges,
  floci,
  onStart,
}: {
  challenges: Challenge[];
  floci: FlociStatus;
  onStart: (challenge: Challenge) => void;
}) {
  const { lang } = useLanguage();
  const t = UI[lang];
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={<LanguageToggle />}
          info={
            floci === 'up' ? (
              <StatusIndicator type="success">Floci</StatusIndicator>
            ) : floci === 'down' ? (
              <StatusIndicator type="error">Floci</StatusIndicator>
            ) : (
              <StatusIndicator type="loading">Floci</StatusIndicator>
            )
          }
        >
          <span className="fts-font" dir={dirOf(lang)}>
            {renderBidi(t.title)}
          </span>
        </Header>
      }
    >
      <div className="fts-font" dir={dirOf(lang)}>
        <SpaceBetween size="l">
          <Box variant="p">{renderBidi(t.intro)}</Box>
          <Cards
            header={<Header variant="h2">{t.challenges}</Header>}
            items={challenges}
            trackBy="id"
            cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 2 }]}
            cardDefinition={{
              header: (challenge) => (
                <span>
                  <Box variant="small" display="block">
                    {t.challenge(challenges.indexOf(challenge) + 1)}
                  </Box>
                  {renderBidi(challenge.title[lang])}
                </span>
              ),
              sections: [
                {
                  id: 'summary',
                  content: (challenge) => renderBidi(challenge.summary[lang]),
                },
                {
                  id: 'start',
                  content: (challenge) => (
                    <Button
                      variant="primary"
                      onClick={() => onStart(challenge)}
                    >
                      {t.start}
                    </Button>
                  ),
                },
              ],
            }}
          />
          <Container header={<Header variant="h2">{t.terminal}</Header>}>
            <SpaceBetween size="xs">
              <Box variant="p">{renderBidi(t.terminalBody)}</Box>
              <pre className="object-preview" dir="ltr">
                {
                  'aws s3 ls\naws s3 cp ./notes.txt s3://fts-lab-data/\naws lambda list-functions'
                }
              </pre>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </div>
    </ContentLayout>
  );
}
