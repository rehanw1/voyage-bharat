import fs from 'node:fs';
import path from 'node:path';

export type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type TourismKnowledgeBase = {
  supported_topics: string[];
  general_tips: string[];
  destinations: Record<string, TourismDestinationRecord>;
};

type TourismDestinationRecord = {
  state: string;
  aliases: string[];
  overview: string;
  places: string[];
  food: string[];
  best_time: string;
  travel_tips: string[];
  local_experiences: string[];
  hotels: string[];
  itineraries: {
    title: string;
    duration_days: number;
    days: {
      day: number;
      title: string;
      plan: string;
    }[];
  }[];
};

export type TourismDestination = TourismDestinationRecord & {
  name: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
};

export type TravelHighlights = {
  places: string[];
  food: string[];
  tips: string[];
};

export type TourismRetrievalResult = {
  isTravelQuery: boolean;
  planningIntent: boolean;
  matchedLocations: string[];
  relevantDestinations: TourismDestination[];
  primaryDestination: TourismDestination | null;
  context: string;
  highlights: TravelHighlights;
  itinerary: ItineraryDay[];
};

const knowledgePath = path.resolve(process.cwd(), 'data', 'tourism-knowledge.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, 'utf8')) as TourismKnowledgeBase;
const destinations = Object.entries(knowledgeBase.destinations).map(([name, destination]) => ({
  name,
  ...destination,
}));

const genericTravelKeywords = [
  'travel',
  'tourism',
  'trip',
  'itinerary',
  'vacation',
  'holiday',
  'destination',
  'visit',
  'hotel',
  'stay',
  'food',
  'restaurant',
  'cafe',
  'local experience',
  'best time',
  'sightseeing',
  'beach',
  'temple',
  'fort',
  'family trip',
  'solo trip',
  'honeymoon',
  'weekend',
  'budget',
  'plan',
  'route',
  'places to see'
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function uniqueItems(values: string[], limit: number): string[] {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function toSearchBlob(destination: TourismDestination): string {
  return normalize(
    [
      destination.name,
      destination.state,
      ...destination.aliases,
      destination.overview,
      ...destination.places,
      ...destination.food,
      destination.best_time,
      ...destination.travel_tips,
      ...destination.local_experiences,
      ...destination.hotels,
      ...destination.itineraries.flatMap((itinerary) => [
        itinerary.title,
        ...itinerary.days.map((day) => `${day.title} ${day.plan}`),
      ]),
    ].join(' ')
  );
}

function getMentionedDestinations(text: string): TourismDestination[] {
  const normalizedText = normalize(text);

  return destinations.filter((destination) => {
    const labels = [destination.name, destination.state, ...destination.aliases];
    return labels.some((label) => normalizedText.includes(normalize(label)));
  });
}

function countTokenMatches(tokens: string[], haystack: string): number {
  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function getScoredDestinations(query: string, historyText: string): TourismDestination[] {
  const queryTokens = tokenize(query);
  const historyTokens = tokenize(historyText);
  const mentionedInQuery = new Set(getMentionedDestinations(query).map((destination) => destination.name));
  const mentionedInHistory = new Set(getMentionedDestinations(historyText).map((destination) => destination.name));

  return destinations
    .map((destination) => {
      const labelsBlob = normalize([destination.name, destination.state, ...destination.aliases].join(' '));
      const searchBlob = toSearchBlob(destination);

      const score =
        (mentionedInQuery.has(destination.name) ? 18 : 0) +
        (mentionedInHistory.has(destination.name) ? 7 : 0) +
        countTokenMatches(queryTokens, labelsBlob) * 6 +
        countTokenMatches(queryTokens, searchBlob) * 2 +
        countTokenMatches(historyTokens, labelsBlob) * 3 +
        countTokenMatches(historyTokens, searchBlob);

      return { destination, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.destination);
}

function hasTravelSignal(text: string): boolean {
  const normalizedText = normalize(text);
  const matchesTopic = [...knowledgeBase.supported_topics, ...genericTravelKeywords].some((keyword) =>
    normalizedText.includes(normalize(keyword))
  );

  return matchesTopic || getMentionedDestinations(text).length > 0;
}

function getBestItinerary(destination: TourismDestination | null): ItineraryDay[] {
  if (!destination?.itineraries.length) {
    return [];
  }

  return destination.itineraries[0].days.map((day) => ({
    day: day.day,
    title: day.title,
    summary: day.plan,
  }));
}

function formatDestinationContext(destination: TourismDestination): string {
  const itineraryText = destination.itineraries
    .map(
      (itinerary) =>
        `${itinerary.title} (${itinerary.duration_days} days): ${itinerary.days
          .map((day) => `Day ${day.day} - ${day.title}: ${day.plan}`)
          .join(' ')}`
    )
    .join(' ');

  return [
    `Destination: ${destination.name}, ${destination.state}`,
    `Overview: ${destination.overview}`,
    `Places: ${destination.places.join(', ')}`,
    `Food: ${destination.food.join(', ')}`,
    `Best time: ${destination.best_time}`,
    `Hotels: ${destination.hotels.join(', ')}`,
    `Local experiences: ${destination.local_experiences.join(', ')}`,
    `Travel tips: ${destination.travel_tips.join(' | ')}`,
    `Sample itineraries: ${itineraryText}`,
  ].join('\n');
}

export function retrieveTourismContext(query: string, history: ChatHistoryMessage[]): TourismRetrievalResult {
  const trimmedQuery = query.trim();
  const limitedHistory = history.slice(-5);
  const historyText = limitedHistory.map((message) => message.content).join(' ');
  const currentMentions = getMentionedDestinations(trimmedQuery);
  const scoredDestinations = getScoredDestinations(trimmedQuery, historyText);

  const planningIntent = /(itinerary|plan|day wise|day-wise|days|weekend|honeymoon|family trip|solo trip|route)/i.test(
    trimmedQuery
  );
  const isTravelQuery =
    hasTravelSignal(trimmedQuery) ||
    (limitedHistory.length > 0 && hasTravelSignal(historyText) && trimmedQuery.length <= 180);

  const relevantDestinations = uniqueItems(
    [...currentMentions.map((item) => item.name), ...scoredDestinations.map((item) => item.name)],
    3
  )
    .map((name) => destinations.find((destination) => destination.name === name) ?? null)
    .filter((destination): destination is TourismDestination => Boolean(destination));

  const primaryDestination =
    currentMentions[0] ??
    relevantDestinations[0] ??
    getMentionedDestinations(historyText)[0] ??
    null;

  const highlights: TravelHighlights = {
    places: uniqueItems(relevantDestinations.flatMap((destination) => destination.places), 5),
    food: uniqueItems(relevantDestinations.flatMap((destination) => destination.food), 4),
    tips: uniqueItems(
      [
        ...relevantDestinations.flatMap((destination) => destination.travel_tips),
        ...knowledgeBase.general_tips,
      ],
      4
    ),
  };

  const context = [
    'Use only the tourism knowledge below when answering.',
    ...relevantDestinations.map(formatDestinationContext),
    `General travel tips: ${knowledgeBase.general_tips.join(' | ')}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    isTravelQuery,
    planningIntent,
    matchedLocations: uniqueItems(
      [
        ...currentMentions.map((destination) => destination.name),
        ...getMentionedDestinations(historyText).map((destination) => destination.name),
      ],
      3
    ),
    relevantDestinations,
    primaryDestination,
    context,
    highlights,
    itinerary: planningIntent ? getBestItinerary(primaryDestination) : [],
  };
}

export function buildFallbackTravelReply(query: string, retrieval: TourismRetrievalResult): string {
  if (!retrieval.isTravelQuery) {
    return 'I can only help with travel-related questions.';
  }

  if (!retrieval.primaryDestination) {
    const sampleDestinations = destinations.slice(0, 3).map((destination) => destination.name).join(', ');
    return `I can help with destinations, itineraries, hotels, food, and local experiences. Try asking about places like ${sampleDestinations}, along with your trip length or travel style.`;
  }

  const destination = retrieval.primaryDestination;
  const headlinePlaces = destination.places.slice(0, 3).join(', ');
  const headlineFood = destination.food.slice(0, 2).join(', ');
  const staySuggestion = destination.hotels[0];
  const keyTip = destination.travel_tips[0];

  if (retrieval.planningIntent && retrieval.itinerary.length > 0) {
    return `${destination.name} is a strong fit for this trip. Best time to go is ${destination.best_time}. Stay around ${staySuggestion}, cover highlights like ${headlinePlaces}, and try ${headlineFood}. I have also included a simple day-wise itinerary below.`;
  }

  if (/hotel|stay|resort|hostel|where to stay/i.test(query)) {
    return `${destination.name} is best visited ${destination.best_time}. For a comfortable stay, start with options like ${destination.hotels
      .slice(0, 2)
      .join(' and ')}. Nearby highlights include ${headlinePlaces}, and a useful local tip is: ${keyTip}`;
  }

  return `${destination.name}, ${destination.state} is best visited ${destination.best_time}. Start with ${headlinePlaces}, try local favorites like ${headlineFood}, and keep this in mind: ${keyTip}`;
}
