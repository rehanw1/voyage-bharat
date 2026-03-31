import { tourismData, tourismLocations } from '../../data/tourismData';

export type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type RetrievalResult = {
  isTravelQuery: boolean;
  matchedLocations: string[];
  context: string;
  hasEnoughContext: boolean;
  availableLocations: string[];
};

const travelKeywords = [
  'travel',
  'trip',
  'tour',
  'tourism',
  'vacation',
  'holiday',
  'itinerary',
  'visit',
  'destination',
  'food',
  'hotel',
  'stay',
  'route',
  'places',
  'beach',
  'museum',
  'fort',
  'temple',
  'plan',
  'journey',
  'experience',
];

const locationAliases: Record<string, string[]> = {
  Goa: ['goa'],
  Mumbai: ['mumbai', 'bombay'],
  Jaipur: ['jaipur'],
  Kerala: ['kerala'],
  Leh: ['leh', 'ladakh'],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isTravelQuestion(query: string, history: ChatHistoryMessage[]): boolean {
  const queryText = normalize(query);
  const historyText = normalize(history.map((message) => message.content).join(' '));

  return (
    travelKeywords.some((keyword) => queryText.includes(keyword)) ||
    tourismLocations.some((location) => queryText.includes(location.toLowerCase())) ||
    tourismLocations.some((location) => historyText.includes(location.toLowerCase()))
  );
}

function findLocations(text: string): string[] {
  const normalizedText = normalize(text);

  return tourismLocations.filter((location) =>
    (locationAliases[location] || [location.toLowerCase()]).some((alias) => normalizedText.includes(alias))
  );
}

function formatLocationContext(location: string): string {
  const details = tourismData[location];

  return [
    `Destination: ${location}`,
    `Places: ${details.places.join(', ')}`,
    `Food: ${details.food.join(', ')}`,
    `Best time: ${details.bestTime}`,
    `Tips: ${details.tips.join(' | ')}`,
    `Experiences: ${details.experiences.join(', ')}`,
  ].join('\n');
}

export function retrieveContext(query: string, history: ChatHistoryMessage[] = []): string {
  return retrieveTourismContext(query, history).context;
}

export function retrieveTourismContext(query: string, history: ChatHistoryMessage[] = []): RetrievalResult {
  const directMatches = findLocations(query);
  const recentHistory = history.slice(-5).reverse();
  const historyMatches = recentHistory.flatMap((message) => findLocations(message.content));
  const matchedLocations = [...new Set([...directMatches, ...historyMatches])].slice(0, 2);
  const isTravelQuery = isTravelQuestion(query, history);

  if (!isTravelQuery) {
    return {
      isTravelQuery: false,
      matchedLocations: [],
      context: '',
      hasEnoughContext: false,
      availableLocations: tourismLocations,
    };
  }

  if (!matchedLocations.length) {
    return {
      isTravelQuery: true,
      matchedLocations: [],
      context: '',
      hasEnoughContext: false,
      availableLocations: tourismLocations,
    };
  }

  return {
    isTravelQuery: true,
    matchedLocations,
    context: matchedLocations.map(formatLocationContext).join('\n\n'),
    hasEnoughContext: true,
    availableLocations: tourismLocations,
  };
}
