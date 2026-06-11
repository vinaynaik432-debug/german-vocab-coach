const STORAGE_KEY = "vinay_german_vocab_coach_v1";
const ROUND_SIZE = 20;
const STARTER_BANK_VERSION = 4;
const LEGACY_PROFILE_NAME = "Vinay";
const DEFAULT_LEVEL = "B1";
const DEFAULT_WEEKLY_GOAL = 30;
const LEVELS = ["A1", "A2", "B1", "B2"];
const TOPIC_PRIORITY = ["alltag", "haushalt", "arbeit", "transport", "gefühle", "gesundheit", "freizeit", "behörden", "abstrakt"];
const TODAY = () => new Date().toISOString().slice(0, 10);
const storage = createStorageAdapter();

const starterWords = [
  ["the responsibility", "die Verantwortung", "noun", "arbeit", "B1", "Used with Verantwortung übernehmen."],
  ["to negotiate", "verhandeln", "verb", "arbeit", "B2", ""],
  ["the appointment", "der Termin", "noun", "alltag", "B1", ""],
  ["to postpone", "verschieben", "verb", "arbeit", "B1", ""],
  ["reliable", "zuverlässig", "adjective", "arbeit", "B1", ""],
  ["the colleague", "der Kollege", "noun", "arbeit", "B1", "Female: die Kollegin."],
  ["the application", "die Bewerbung", "noun", "arbeit", "B1", ""],
  ["the job posting", "die Stellenausschreibung", "noun", "arbeit", "B2", ""],
  ["to apply", "sich bewerben", "verb", "arbeit", "B1", "Reflexive: ich bewerbe mich."],
  ["the salary", "das Gehalt", "noun", "arbeit", "B1", ""],
  ["the contract", "der Vertrag", "noun", "arbeit", "B1", ""],
  ["to sign", "unterschreiben", "verb", "arbeit", "B1", ""],
  ["the meeting", "die Besprechung", "noun", "arbeit", "B1", ""],
  ["the task", "die Aufgabe", "noun", "arbeit", "B1", ""],
  ["to finish", "erledigen", "verb", "arbeit", "B1", ""],
  ["urgent", "dringend", "adjective", "arbeit", "B1", ""],
  ["the deadline", "die Frist", "noun", "arbeit", "B2", ""],
  ["the experience", "die Erfahrung", "noun", "arbeit", "B1", ""],
  ["the skill", "die Fähigkeit", "noun", "arbeit", "B1", ""],
  ["to improve", "verbessern", "verb", "arbeit", "B1", ""],
  ["the apartment", "die Wohnung", "noun", "alltag", "B1", ""],
  ["the rent", "die Miete", "noun", "alltag", "B1", ""],
  ["the tenant", "der Mieter", "noun", "alltag", "B1", "Female: die Mieterin."],
  ["the landlord", "der Vermieter", "noun", "alltag", "B1", "Female: die Vermieterin."],
  ["the heating", "die Heizung", "noun", "haushalt", "B1", ""],
  ["to vacuum", "staubsaugen", "verb", "haushalt", "B1", ""],
  ["the laundry", "die Wäsche", "noun", "haushalt", "B1", ""],
  ["to wash dishes", "spülen", "verb", "haushalt", "B1", ""],
  ["the garbage", "der Müll", "noun", "haushalt", "A2", ""],
  ["to throw away", "wegwerfen", "verb", "haushalt", "B1", ""],
  ["the grocery store", "der Supermarkt", "noun", "alltag", "A2", ""],
  ["the receipt", "der Kassenzettel", "noun", "alltag", "B1", ""],
  ["the discount", "der Rabatt", "noun", "alltag", "B1", ""],
  ["to pay in cash", "bar bezahlen", "phrase", "alltag", "A2", ""],
  ["the queue", "die Schlange", "noun", "alltag", "B1", ""],
  ["to wait", "warten", "verb", "alltag", "A2", ""],
  ["annoying", "nervig", "adjective", "gefühle", "B1", "Colloquial and useful."],
  ["exhausted", "erschöpft", "adjective", "gefühle", "B1", ""],
  ["worried", "besorgt", "adjective", "gefühle", "B1", ""],
  ["relieved", "erleichtert", "adjective", "gefühle", "B1", ""],
  ["embarrassing", "peinlich", "adjective", "gefühle", "B1", ""],
  ["the mood", "die Stimmung", "noun", "gefühle", "B1", ""],
  ["the fear", "die Angst", "noun", "gefühle", "A2", ""],
  ["to trust", "vertrauen", "verb", "gefühle", "B1", ""],
  ["the train station", "der Bahnhof", "noun", "transport", "A2", ""],
  ["the platform", "der Bahnsteig", "noun", "transport", "B1", ""],
  ["the delay", "die Verspätung", "noun", "transport", "B1", ""],
  ["the replacement bus", "der Ersatzbus", "noun", "transport", "B2", ""],
  ["to change trains", "umsteigen", "verb", "transport", "B1", ""],
  ["to miss the train", "den Zug verpassen", "phrase", "transport", "B1", ""],
  ["the ticket machine", "der Fahrkartenautomat", "noun", "transport", "B1", ""],
  ["the monthly pass", "die Monatskarte", "noun", "transport", "B1", ""],
  ["the bike lane", "der Fahrradweg", "noun", "transport", "B1", ""],
  ["the intersection", "die Kreuzung", "noun", "transport", "B1", ""],
  ["the health insurance", "die Krankenversicherung", "noun", "gesundheit", "B2", ""],
  ["the appointment with a doctor", "der Arzttermin", "noun", "gesundheit", "B1", ""],
  ["the prescription", "das Rezept", "noun", "gesundheit", "B1", "Also means recipe."],
  ["the pharmacy", "die Apotheke", "noun", "gesundheit", "A2", ""],
  ["the pain", "der Schmerz", "noun", "gesundheit", "B1", ""],
  ["to cough", "husten", "verb", "gesundheit", "A2", ""],
  ["the fever", "das Fieber", "noun", "gesundheit", "A2", ""],
  ["sick leave", "die Krankschreibung", "noun", "gesundheit", "B2", ""],
  ["to recover", "sich erholen", "verb", "gesundheit", "B1", ""],
  ["dizzy", "schwindelig", "adjective", "gesundheit", "B1", ""],
  ["the authority office", "die Behörde", "noun", "behörden", "B2", ""],
  ["the registration office", "das Bürgeramt", "noun", "behörden", "B1", ""],
  ["the registration", "die Anmeldung", "noun", "behörden", "B1", ""],
  ["the residence permit", "der Aufenthaltstitel", "noun", "behörden", "B2", ""],
  ["the document", "das Dokument", "noun", "behörden", "B1", ""],
  ["the form", "das Formular", "noun", "behörden", "B1", ""],
  ["to fill out", "ausfüllen", "verb", "behörden", "B1", ""],
  ["to submit", "einreichen", "verb", "behörden", "B2", ""],
  ["valid", "gültig", "adjective", "behörden", "B1", ""],
  ["the proof", "der Nachweis", "noun", "behörden", "B2", ""],
  ["the leisure time", "die Freizeit", "noun", "freizeit", "B1", ""],
  ["the hike", "die Wanderung", "noun", "freizeit", "B1", ""],
  ["to relax", "sich entspannen", "verb", "freizeit", "B1", ""],
  ["the club", "der Verein", "noun", "freizeit", "B1", ""],
  ["the exhibition", "die Ausstellung", "noun", "freizeit", "B1", ""],
  ["to take part", "teilnehmen", "verb", "freizeit", "B1", ""],
  ["the invitation", "die Einladung", "noun", "freizeit", "B1", ""],
  ["to cancel", "absagen", "verb", "alltag", "B1", ""],
  ["to agree", "zustimmen", "verb", "abstrakt", "B1", ""],
  ["to disagree", "widersprechen", "verb", "abstrakt", "B2", ""],
  ["the opinion", "die Meinung", "noun", "abstrakt", "B1", ""],
  ["the decision", "die Entscheidung", "noun", "abstrakt", "B1", ""],
  ["the solution", "die Lösung", "noun", "abstrakt", "B1", ""],
  ["the reason", "der Grund", "noun", "abstrakt", "B1", ""],
  ["the advantage", "der Vorteil", "noun", "abstrakt", "B1", ""],
  ["the disadvantage", "der Nachteil", "noun", "abstrakt", "B1", ""],
  ["to avoid", "vermeiden", "verb", "abstrakt", "B1", ""],
  ["to compare", "vergleichen", "verb", "abstrakt", "B1", ""],
  ["to depend on", "abhängen von", "phrase", "abstrakt", "B1", ""],
  ["probably", "wahrscheinlich", "adverb", "alltag", "B1", ""],
  ["anyway", "sowieso", "adverb", "alltag", "B1", ""],
  ["meanwhile", "inzwischen", "adverb", "alltag", "B1", ""],
  ["at least", "mindestens", "adverb", "alltag", "B1", ""],
  ["especially", "besonders", "adverb", "alltag", "B1", ""],
  ["although", "obwohl", "conjunction", "abstrakt", "B1", ""],
  ["therefore", "deshalb", "adverb", "abstrakt", "B1", ""],
  ["despite that", "trotzdem", "adverb", "abstrakt", "B1", ""],
  ["to forget", "vergessen", "verb", "alltag", "A2", ""],
  ["to remember", "sich erinnern", "verb", "alltag", "B1", ""],
  ["to decide", "sich entscheiden", "verb", "abstrakt", "B1", ""],
  ["to offer", "anbieten", "verb", "alltag", "B1", ""],
  ["to complain", "sich beschweren", "verb", "alltag", "B1", ""],
  ["the complaint", "die Beschwerde", "noun", "alltag", "B1", ""],
  ["the environment", "die Umwelt", "noun", "abstrakt", "B1", ""],
  ["the waste separation", "die Mülltrennung", "noun", "haushalt", "B2", ""],
  ["the neighborhood", "die Nachbarschaft", "noun", "alltag", "B1", ""],
  ["the accident", "der Unfall", "noun", "transport", "B1", ""],
  ["the insurance", "die Versicherung", "noun", "alltag", "B1", ""],
  ["the damage", "der Schaden", "noun", "alltag", "B1", ""],
  ["to repair", "reparieren", "verb", "haushalt", "B1", ""],
  ["broken", "kaputt", "adjective", "haushalt", "A2", ""],
  ["the tool", "das Werkzeug", "noun", "haushalt", "B1", ""],
  ["careful", "vorsichtig", "adjective", "alltag", "B1", ""],
  ["necessary", "notwendig", "adjective", "abstrakt", "B1", ""],
  ["possible", "möglich", "adjective", "abstrakt", "B1", ""],
  ["available", "verfügbar", "adjective", "arbeit", "B2", ""],
  ["the requirement", "die Voraussetzung", "noun", "arbeit", "B2", ""],
  ["the training", "die Weiterbildung", "noun", "arbeit", "B2", ""],
  ["self-employed", "selbstständig", "adjective", "arbeit", "B2", ""],
  ["the invoice", "die Rechnung", "noun", "arbeit", "B1", "Also means bill."],
  ["the bank transfer", "die Überweisung", "noun", "alltag", "B1", ""],
  ["the account", "das Konto", "noun", "alltag", "B1", ""],
  ["to withdraw money", "Geld abheben", "phrase", "alltag", "B1", ""],
];

function packStarterWords(topic, difficulty, rows) {
  return rows.map(([word_en, word_de, part_of_speech, notes = ""]) => [word_en, word_de, part_of_speech, topic, difficulty, notes]);
}

const supplementalStarterWords = [
  ...packStarterWords("alltag", "A1", [
    ["the apple", "der Apfel", "noun"],
    ["the bread", "das Brot", "noun"],
    ["the water", "das Wasser", "noun"],
    ["the coffee", "der Kaffee", "noun"],
    ["the milk", "die Milch", "noun"],
    ["the cheese", "der Käse", "noun"],
    ["the egg", "das Ei", "noun"],
    ["the rice", "der Reis", "noun"],
    ["the money", "das Geld", "noun"],
    ["the house", "das Haus", "noun"],
    ["the street", "die Straße", "noun"],
    ["the city", "die Stadt", "noun"],
    ["the day", "der Tag", "noun"],
    ["the week", "die Woche", "noun"],
    ["the morning", "der Morgen", "noun"],
    ["the evening", "der Abend", "noun"],
    ["the name", "der Name", "noun"],
    ["the person", "die Person", "noun"],
    ["the child", "das Kind", "noun"],
    ["the woman", "die Frau", "noun"],
    ["the man", "der Mann", "noun"],
    ["to eat", "essen", "verb"],
    ["to drink", "trinken", "verb"],
    ["to buy", "kaufen", "verb"],
    ["to have", "haben", "verb"],
    ["to be", "sein", "verb"],
    ["to live", "wohnen", "verb"],
    ["to come", "kommen", "verb"],
    ["to go", "gehen", "verb"],
    ["good", "gut", "adjective"],
    ["bad", "schlecht", "adjective"],
    ["small", "klein", "adjective"],
    ["big", "groß", "adjective"],
    ["new", "neu", "adjective"],
    ["old", "alt", "adjective"],
    ["today", "heute", "adverb"],
    ["tomorrow", "morgen", "adverb"],
  ]),
  ...packStarterWords("transport", "A1", [
    ["the bicycle", "das Fahrrad", "noun"],
    ["the taxi", "das Taxi", "noun"],
    ["the ticket", "die Fahrkarte", "noun"],
    ["to walk", "laufen", "verb"],
    ["left", "links", "adverb"],
    ["right", "rechts", "adverb"],
  ]),
  ...packStarterWords("gesundheit", "A1", [
    ["the doctor", "der Arzt", "noun", "Female: die Ärztin."],
    ["the head", "der Kopf", "noun"],
    ["the stomach", "der Bauch", "noun"],
    ["sick", "krank", "adjective"],
    ["healthy", "gesund", "adjective"],
  ]),
  ...packStarterWords("arbeit", "B1", [
    ["the workplace", "der Arbeitsplatz", "noun"],
    ["the working hours", "die Arbeitszeit", "noun"],
    ["part-time work", "die Teilzeit", "noun"],
    ["full-time work", "die Vollzeit", "noun"],
    ["the probation period", "die Probezeit", "noun"],
    ["the resignation", "die Kündigung", "noun"],
    ["the promotion", "die Beförderung", "noun"],
    ["the department", "die Abteilung", "noun"],
    ["the team", "das Team", "noun"],
    ["the supervisor", "der Vorgesetzte", "noun"],
    ["the boss", "der Chef", "noun", "Female: die Chefin."],
    ["the employee", "der Mitarbeiter", "noun", "Female: die Mitarbeiterin."],
    ["the employer", "der Arbeitgeber", "noun"],
    ["the employee as worker", "der Arbeitnehmer", "noun"],
    ["the shift", "die Schicht", "noun"],
    ["the break", "die Pause", "noun"],
    ["the project", "das Projekt", "noun"],
    ["the customer", "der Kunde", "noun", "Female: die Kundin."],
    ["the client", "der Auftraggeber", "noun", "Female: die Auftraggeberin."],
    ["the order", "der Auftrag", "noun"],
    ["the presentation", "die Präsentation", "noun"],
    ["the feedback", "das Feedback", "noun"],
    ["the email", "die E-Mail", "noun"],
    ["the message", "die Nachricht", "noun"],
    ["the phone call", "der Anruf", "noun"],
    ["the call", "das Telefonat", "noun"],
    ["the office", "das Büro", "noun"],
    ["the home office", "das Homeoffice", "noun"],
    ["the equipment", "die Ausstattung", "noun"],
    ["the file", "die Datei", "noun"],
    ["the folder", "der Ordner", "noun"],
    ["the printer", "der Drucker", "noun"],
    ["the appointment calendar", "der Kalender", "noun"],
    ["the note", "die Notiz", "noun"],
    ["the mistake at work", "der Fehler", "noun"],
    ["to hire", "einstellen", "verb"],
    ["to quit", "kündigen", "verb"],
    ["to plan", "planen", "verb"],
    ["to organize", "organisieren", "verb"],
    ["to prepare", "vorbereiten", "verb"],
    ["to introduce", "vorstellen", "verb"],
    ["to convince", "überzeugen", "verb"],
    ["to cooperate", "zusammenarbeiten", "verb"],
    ["to process", "bearbeiten", "verb"],
    ["to reach someone", "erreichen", "verb"],
    ["to report sick", "sich krankmelden", "verb"],
    ["punctual", "pünktlich", "adjective"],
    ["flexible", "flexibel", "adjective"],
    ["resilient", "belastbar", "adjective"],
    ["suitable", "geeignet", "adjective"],
    ["professional", "beruflich", "adjective"],
  ]),
  ...packStarterWords("alltag", "B1", [
    ["the bag", "die Tasche", "noun"],
    ["the key", "der Schlüssel", "noun"],
    ["the wallet", "das Portemonnaie", "noun"],
    ["the ID card", "der Ausweis", "noun"],
    ["the receipt as proof", "die Quittung", "noun"],
    ["the purchase", "der Einkauf", "noun"],
    ["the opening hours", "die Öffnungszeiten", "noun"],
    ["the shop", "der Laden", "noun"],
    ["the bakery", "die Bäckerei", "noun"],
    ["the butcher shop", "die Metzgerei", "noun"],
    ["the offer", "das Angebot", "noun"],
    ["the price", "der Preis", "noun"],
    ["the size", "die Größe", "noun"],
    ["the color", "die Farbe", "noun"],
    ["the brand", "die Marke", "noun"],
    ["the quality", "die Qualität", "noun"],
    ["the delivery", "die Lieferung", "noun"],
    ["the order online", "die Bestellung", "noun"],
    ["the return", "die Rückgabe", "noun"],
    ["the exchange", "der Umtausch", "noun"],
    ["the guarantee", "die Garantie", "noun"],
    ["the customer card", "die Kundenkarte", "noun"],
    ["the package", "das Paket", "noun"],
    ["the parcel service", "der Paketdienst", "noun"],
    ["the post office", "die Post", "noun"],
    ["the address", "die Adresse", "noun"],
    ["the phone number", "die Telefonnummer", "noun"],
    ["the contact", "der Kontakt", "noun"],
    ["the calendar week", "die Kalenderwoche", "noun"],
    ["the everyday life", "der Alltag", "noun"],
    ["the plan for the day", "der Tagesplan", "noun"],
    ["the habit", "die Gewohnheit", "noun"],
    ["the reminder", "die Erinnerung", "noun"],
    ["to shop", "einkaufen", "verb"],
    ["to order", "bestellen", "verb"],
    ["to return something", "zurückgeben", "verb"],
    ["to exchange", "umtauschen", "verb"],
    ["to try out", "ausprobieren", "verb"],
    ["to try on", "anprobieren", "verb"],
    ["to reserve", "reservieren", "verb"],
    ["to save money", "sparen", "verb"],
    ["to spend money", "Geld ausgeben", "phrase"],
    ["to search for", "suchen", "verb"],
    ["to find", "finden", "verb"],
    ["to lose", "verlieren", "verb"],
    ["to find again", "wiederfinden", "verb"],
    ["to charge", "aufladen", "verb"],
    ["cheap", "günstig", "adjective"],
    ["expensive", "teuer", "adjective"],
    ["comfortable", "bequem", "adjective"],
    ["suitable in size", "passend", "adjective"],
    ["empty", "leer", "adjective"],
    ["full", "voll", "adjective"],
    ["fresh", "frisch", "adjective"],
    ["used", "gebraucht", "adjective"],
    ["tidy", "ordentlich", "adjective"],
  ]),
  ...packStarterWords("haushalt", "B1", [
    ["the room", "das Zimmer", "noun"],
    ["the living room", "das Wohnzimmer", "noun"],
    ["the bedroom", "das Schlafzimmer", "noun"],
    ["the kitchen", "die Küche", "noun"],
    ["the bathroom", "das Bad", "noun"],
    ["the hallway", "der Flur", "noun"],
    ["the balcony", "der Balkon", "noun"],
    ["the basement", "der Keller", "noun"],
    ["the elevator", "der Aufzug", "noun"],
    ["the door", "die Tür", "noun"],
    ["the window", "das Fenster", "noun"],
    ["the lamp", "die Lampe", "noun"],
    ["the wardrobe", "der Schrank", "noun"],
    ["the shelf", "das Regal", "noun"],
    ["the table", "der Tisch", "noun"],
    ["the chair", "der Stuhl", "noun"],
    ["the bed", "das Bett", "noun"],
    ["the sofa", "das Sofa", "noun"],
    ["the carpet", "der Teppich", "noun"],
    ["the curtain", "die Gardine", "noun"],
    ["the stove", "der Herd", "noun"],
    ["the refrigerator", "der Kühlschrank", "noun"],
    ["the dishwasher", "die Spülmaschine", "noun"],
    ["the washing machine", "die Waschmaschine", "noun"],
    ["the dryer", "der Trockner", "noun"],
    ["the vacuum cleaner", "der Staubsauger", "noun"],
    ["the broom", "der Besen", "noun"],
    ["the cloth", "der Lappen", "noun"],
    ["the bucket", "der Eimer", "noun"],
    ["the cleaning product", "das Putzmittel", "noun"],
    ["the socket", "die Steckdose", "noun"],
    ["the light bulb", "die Glühbirne", "noun"],
    ["the electricity", "der Strom", "noun"],
    ["the water", "das Wasser", "noun"],
    ["the utilities", "die Nebenkosten", "noun"],
    ["the deposit", "die Kaution", "noun"],
    ["the rental contract", "der Mietvertrag", "noun"],
    ["the caretaker", "der Hausmeister", "noun"],
    ["the neighbor", "der Nachbar", "noun", "Female: die Nachbarin."],
    ["the move to a new home", "der Umzug", "noun"],
    ["to clean", "putzen", "verb"],
    ["to tidy up", "aufräumen", "verb"],
    ["to air the room", "lüften", "verb"],
    ["to heat", "heizen", "verb"],
    ["to cook", "kochen", "verb"],
    ["to bake", "backen", "verb"],
    ["to mop", "wischen", "verb"],
    ["to move in", "einziehen", "verb"],
    ["to move out", "ausziehen", "verb"],
    ["to move house", "umziehen", "verb"],
    ["to lock", "abschließen", "verb"],
    ["to unlock", "aufschließen", "verb"],
    ["clean", "sauber", "adjective"],
    ["dirty", "schmutzig", "adjective"],
    ["cozy", "gemütlich", "adjective"],
    ["loud", "laut", "adjective"],
    ["quiet", "ruhig", "adjective"],
    ["bright", "hell", "adjective"],
    ["dark", "dunkel", "adjective"],
    ["wet", "nass", "adjective"],
    ["dry", "trocken", "adjective"],
  ]),
  ...packStarterWords("transport", "B1", [
    ["the stop", "die Haltestelle", "noun"],
    ["the subway", "die U-Bahn", "noun"],
    ["the city train", "die S-Bahn", "noun"],
    ["the tram", "die Straßenbahn", "noun"],
    ["the bus", "der Bus", "noun"],
    ["the train", "der Zug", "noun"],
    ["the track", "das Gleis", "noun"],
    ["the connection", "die Verbindung", "noun"],
    ["the timetable", "der Fahrplan", "noun"],
    ["the departure", "die Abfahrt", "noun"],
    ["the arrival", "die Ankunft", "noun"],
    ["the connecting train", "der Anschluss", "noun"],
    ["the direction", "die Richtung", "noun"],
    ["the line", "die Linie", "noun"],
    ["the fare zone", "die Zone", "noun"],
    ["the ticket", "der Fahrschein", "noun"],
    ["the ticket check", "die Kontrolle", "noun"],
    ["the ticket inspector", "der Kontrolleur", "noun"],
    ["the construction site", "die Baustelle", "noun"],
    ["the detour", "die Umleitung", "noun"],
    ["the traffic jam", "der Stau", "noun"],
    ["the highway", "die Autobahn", "noun"],
    ["the exit", "die Ausfahrt", "noun"],
    ["the entrance", "die Einfahrt", "noun"],
    ["the parking space", "der Parkplatz", "noun"],
    ["the parking garage", "das Parkhaus", "noun"],
    ["the gas station", "die Tankstelle", "noun"],
    ["the driving license", "der Führerschein", "noun"],
    ["the car", "das Auto", "noun"],
    ["the tire", "der Reifen", "noun"],
    ["the workshop", "die Werkstatt", "noun"],
    ["the traffic light", "die Ampel", "noun"],
    ["the pedestrian", "der Fußgänger", "noun", "Female: die Fußgängerin."],
    ["the crosswalk", "der Zebrastreifen", "noun"],
    ["to drive", "fahren", "verb"],
    ["to leave by vehicle", "losfahren", "verb"],
    ["to arrive", "ankommen", "verb"],
    ["to get in", "einsteigen", "verb"],
    ["to get out", "aussteigen", "verb"],
    ["to park", "parken", "verb"],
    ["to park into a space", "einparken", "verb"],
    ["to refuel", "tanken", "verb"],
    ["to brake", "bremsen", "verb"],
    ["to overtake", "überholen", "verb"],
    ["to turn", "abbiegen", "verb"],
    ["delayed", "verspätet", "adjective"],
    ["direct", "direkt", "adjective"],
    ["fast", "schnell", "adjective"],
    ["slow", "langsam", "adjective"],
  ]),
  ...packStarterWords("gesundheit", "B1", [
    ["the doctor", "der Arzt", "noun", "Female: die Ärztin."],
    ["the medical practice", "die Praxis", "noun"],
    ["the family doctor", "der Hausarzt", "noun", "Female: die Hausärztin."],
    ["the specialist doctor", "der Facharzt", "noun", "Female: die Fachärztin."],
    ["the hospital", "das Krankenhaus", "noun"],
    ["the clinic", "die Klinik", "noun"],
    ["the emergency room", "die Notaufnahme", "noun"],
    ["the emergency call", "der Notruf", "noun"],
    ["the examination", "die Untersuchung", "noun"],
    ["the treatment", "die Behandlung", "noun"],
    ["the diagnosis", "die Diagnose", "noun"],
    ["the therapy", "die Therapie", "noun"],
    ["the medication", "das Medikament", "noun"],
    ["the tablet", "die Tablette", "noun"],
    ["the ointment", "die Salbe", "noun"],
    ["the vaccination", "die Impfung", "noun"],
    ["the referral", "die Überweisung", "noun", "Also used for a bank transfer."],
    ["the health insurance company", "die Krankenkasse", "noun"],
    ["the insurance card", "die Versichertenkarte", "noun"],
    ["the symptom", "das Symptom", "noun"],
    ["the allergy", "die Allergie", "noun"],
    ["the cold", "die Erkältung", "noun"],
    ["the flu", "die Grippe", "noun"],
    ["the cough", "der Husten", "noun"],
    ["the runny nose", "der Schnupfen", "noun"],
    ["the sore throat", "die Halsschmerzen", "noun", "Usually plural in German."],
    ["the back", "der Rücken", "noun"],
    ["the stomach", "der Bauch", "noun"],
    ["the head", "der Kopf", "noun"],
    ["the arm", "der Arm", "noun"],
    ["the leg", "das Bein", "noun"],
    ["the hand", "die Hand", "noun"],
    ["the foot", "der Fuß", "noun"],
    ["the eye", "das Auge", "noun"],
    ["the ear", "das Ohr", "noun"],
    ["the tooth", "der Zahn", "noun"],
    ["the dentist", "der Zahnarzt", "noun", "Female: die Zahnärztin."],
    ["to examine", "untersuchen", "verb"],
    ["to treat", "behandeln", "verb"],
    ["to prescribe", "verschreiben", "verb"],
    ["to take medicine", "einnehmen", "verb"],
    ["to measure", "messen", "verb"],
    ["to injure oneself", "sich verletzen", "verb"],
    ["to hurt", "weh tun", "phrase"],
    ["to rest", "sich ausruhen", "verb"],
    ["to get healthy", "gesund werden", "phrase"],
    ["healthy", "gesund", "adjective"],
    ["weak", "schwach", "adjective"],
    ["strong", "stark", "adjective"],
    ["contagious", "ansteckend", "adjective"],
    ["tired", "müde", "adjective"],
  ]),
  ...packStarterWords("behörden", "B2", [
    ["the application form request", "der Antrag", "noun"],
    ["the certificate", "die Bescheinigung", "noun"],
    ["the birth certificate", "die Geburtsurkunde", "noun"],
    ["the registration certificate", "die Meldebescheinigung", "noun"],
    ["the passport", "der Reisepass", "noun"],
    ["the national ID card", "der Personalausweis", "noun"],
    ["the visa", "das Visum", "noun"],
    ["the stay", "der Aufenthalt", "noun"],
    ["the work permit", "die Arbeitserlaubnis", "noun"],
    ["the tax ID number", "die Steueridentifikationsnummer", "noun"],
    ["the tax return", "die Steuererklärung", "noun"],
    ["the tax office", "das Finanzamt", "noun"],
    ["the immigration office", "die Ausländerbehörde", "noun"],
    ["the office as authority", "das Amt", "noun"],
    ["the case worker", "der Sachbearbeiter", "noun", "Female: die Sachbearbeiterin."],
    ["the waiting number", "die Wartemarke", "noun"],
    ["the number", "die Nummer", "noun"],
    ["the counter", "der Schalter", "noun"],
    ["the signature", "die Unterschrift", "noun"],
    ["the copy", "die Kopie", "noun"],
    ["the original", "das Original", "noun"],
    ["the translation", "die Übersetzung", "noun"],
    ["the stamp", "der Stempel", "noun"],
    ["the fee", "die Gebühr", "noun"],
    ["the reminder letter", "die Mahnung", "noun"],
    ["the email address", "die E-Mail-Adresse", "noun"],
    ["the letter", "der Brief", "noun"],
    ["the mailbox", "der Briefkasten", "noun"],
    ["the appointment confirmation", "die Terminbestätigung", "noun"],
    ["the waiting time", "die Wartezeit", "noun"],
    ["the processing time", "die Bearbeitungszeit", "noun"],
    ["the decision notice", "der Bescheid", "noun"],
    ["the permit", "die Erlaubnis", "noun"],
    ["the obligation", "die Pflicht", "noun"],
    ["to apply for", "beantragen", "verb"],
    ["to confirm", "bestätigen", "verb"],
    ["to copy", "kopieren", "verb"],
    ["to certify", "beglaubigen", "verb"],
    ["to pay", "bezahlen", "verb"],
    ["to bring along", "mitbringen", "verb"],
    ["to check", "prüfen", "verb"],
    ["to approve", "genehmigen", "verb"],
    ["to reject", "ablehnen", "verb"],
    ["to extend", "verlängern", "verb"],
    ["to deregister", "abmelden", "verb"],
    ["to change registration", "ummelden", "verb"],
    ["required", "erforderlich", "adjective"],
    ["complete", "vollständig", "adjective"],
    ["incomplete", "unvollständig", "adjective"],
    ["official", "offiziell", "adjective"],
    ["personal in person", "persönlich", "adjective"],
    ["written", "schriftlich", "adjective"],
  ]),
  ...packStarterWords("freizeit", "B1", [
    ["the friend", "der Freund", "noun", "Female: die Freundin."],
    ["the family", "die Familie", "noun"],
    ["the visit", "der Besuch", "noun"],
    ["the guest", "der Gast", "noun"],
    ["the party", "die Party", "noun"],
    ["the celebration", "die Feier", "noun"],
    ["the birthday", "der Geburtstag", "noun"],
    ["the gift", "das Geschenk", "noun"],
    ["the music", "die Musik", "noun"],
    ["the movie", "der Film", "noun"],
    ["the series", "die Serie", "noun"],
    ["the book", "das Buch", "noun"],
    ["the newspaper", "die Zeitung", "noun"],
    ["the game", "das Spiel", "noun"],
    ["the sport", "der Sport", "noun"],
    ["the gym", "das Fitnessstudio", "noun"],
    ["the swimming pool", "das Schwimmbad", "noun"],
    ["the park", "der Park", "noun"],
    ["the lake", "der See", "noun"],
    ["the forest", "der Wald", "noun"],
    ["the trip", "die Reise", "noun"],
    ["the vacation", "der Urlaub", "noun"],
    ["the accommodation", "die Unterkunft", "noun"],
    ["the hotel", "das Hotel", "noun"],
    ["the holiday apartment", "die Ferienwohnung", "noun"],
    ["the excursion", "der Ausflug", "noun"],
    ["the concert", "das Konzert", "noun"],
    ["the theater", "das Theater", "noun"],
    ["the cinema", "das Kino", "noun"],
    ["the museum", "das Museum", "noun"],
    ["the restaurant", "das Restaurant", "noun"],
    ["the cafe", "das Café", "noun"],
    ["the pub", "die Kneipe", "noun"],
    ["the reservation", "die Reservierung", "noun"],
    ["the bill at a restaurant", "die Rechnung", "noun"],
    ["to invite", "einladen", "verb"],
    ["to visit", "besuchen", "verb"],
    ["to celebrate", "feiern", "verb"],
    ["to give a gift", "schenken", "verb"],
    ["to read", "lesen", "verb"],
    ["to watch", "schauen", "verb"],
    ["to play", "spielen", "verb"],
    ["to train", "trainieren", "verb"],
    ["to swim", "schwimmen", "verb"],
    ["to go for a walk", "spazieren gehen", "phrase"],
    ["to travel", "reisen", "verb"],
    ["to book", "buchen", "verb"],
    ["to enjoy", "genießen", "verb"],
    ["to meet", "sich treffen", "verb"],
    ["to arrange to meet", "sich verabreden", "verb"],
    ["to laugh", "lachen", "verb"],
    ["to tell a story", "erzählen", "verb"],
    ["tasty", "lecker", "adjective"],
    ["boring", "langweilig", "adjective"],
    ["exciting", "spannend", "adjective"],
    ["interesting", "interessant", "adjective"],
    ["free of charge", "kostenlos", "adjective"],
    ["fully booked", "ausgebucht", "adjective"],
  ]),
  ...packStarterWords("gefühle", "B1", [
    ["happy", "glücklich", "adjective"],
    ["sad", "traurig", "adjective"],
    ["angry", "wütend", "adjective"],
    ["disappointed", "enttäuscht", "adjective"],
    ["satisfied", "zufrieden", "adjective"],
    ["dissatisfied", "unzufrieden", "adjective"],
    ["proud", "stolz", "adjective"],
    ["uncertain", "unsicher", "adjective"],
    ["safe or certain", "sicher", "adjective"],
    ["nervous", "nervös", "adjective"],
    ["calm", "ruhig", "adjective"],
    ["stressed", "gestresst", "adjective"],
    ["surprised", "überrascht", "adjective"],
    ["grateful", "dankbar", "adjective"],
    ["lonely", "einsam", "adjective"],
    ["in love", "verliebt", "adjective"],
    ["jealous", "eifersüchtig", "adjective"],
    ["hopeful", "hoffnungsvoll", "adjective"],
    ["clueless", "ratlos", "adjective"],
    ["the joy", "die Freude", "noun"],
    ["the sadness", "die Trauer", "noun"],
    ["the anger", "die Wut", "noun"],
    ["the disappointment", "die Enttäuschung", "noun"],
    ["the satisfaction", "die Zufriedenheit", "noun"],
    ["the worry", "die Sorge", "noun"],
    ["the stress", "der Stress", "noun"],
    ["the surprise", "die Überraschung", "noun"],
    ["the pride", "der Stolz", "noun"],
    ["the trust", "das Vertrauen", "noun"],
    ["to be happy about", "sich freuen", "verb"],
    ["to get annoyed", "sich ärgern", "verb"],
    ["to worry", "sich Sorgen machen", "phrase"],
    ["to miss someone", "vermissen", "verb"],
    ["to hope", "hoffen", "verb"],
    ["to doubt", "zweifeln", "verb"],
    ["to be ashamed", "sich schämen", "verb"],
    ["to be bored", "sich langweilen", "verb"],
    ["to calm down", "sich beruhigen", "verb"],
    ["to apologize", "sich entschuldigen", "verb"],
    ["to thank", "danken", "verb"],
    ["to argue", "streiten", "verb"],
    ["to discuss", "diskutieren", "verb"],
    ["to explain", "erklären", "verb"],
    ["to listen", "zuhören", "verb"],
    ["to ask a follow-up question", "nachfragen", "verb"],
  ]),
  ...packStarterWords("abstrakt", "B1", [
    ["the goal", "das Ziel", "noun"],
    ["the plan", "der Plan", "noun"],
    ["the idea", "die Idee", "noun"],
    ["the suggestion", "der Vorschlag", "noun"],
    ["the possibility", "die Möglichkeit", "noun"],
    ["the opportunity", "die Gelegenheit", "noun"],
    ["the problem", "das Problem", "noun"],
    ["the difficulty", "die Schwierigkeit", "noun"],
    ["the question", "die Frage", "noun"],
    ["the answer", "die Antwort", "noun"],
    ["the cause", "die Ursache", "noun"],
    ["the consequence", "die Folge", "noun"],
    ["the result", "das Ergebnis", "noun"],
    ["the difference", "der Unterschied", "noun"],
    ["the similarity", "die Ähnlichkeit", "noun"],
    ["the rule", "die Regel", "noun"],
    ["the exception", "die Ausnahme", "noun"],
    ["the explanation", "die Erklärung", "noun"],
    ["the example", "das Beispiel", "noun"],
    ["the meaning", "die Bedeutung", "noun"],
    ["the connection", "der Zusammenhang", "noun"],
    ["the condition", "die Bedingung", "noun"],
    ["the change", "die Veränderung", "noun"],
    ["the improvement", "die Verbesserung", "noun"],
    ["the development", "die Entwicklung", "noun"],
    ["the progress", "der Fortschritt", "noun"],
    ["the future", "die Zukunft", "noun"],
    ["the past", "die Vergangenheit", "noun"],
    ["the present", "die Gegenwart", "noun"],
    ["the situation", "die Situation", "noun"],
    ["the topic", "das Thema", "noun"],
    ["the detail", "das Detail", "noun"],
    ["the overview", "der Überblick", "noun"],
    ["the focus", "der Fokus", "noun"],
    ["the priority", "die Priorität", "noun"],
    ["to understand", "verstehen", "verb"],
    ["to justify", "begründen", "verb"],
    ["to prove", "beweisen", "verb"],
    ["to consider", "überlegen", "verb"],
    ["to think about", "nachdenken", "verb"],
    ["to believe", "glauben", "verb"],
    ["to mean as opinion", "meinen", "verb"],
    ["to notice or determine", "feststellen", "verb"],
    ["to recognize", "erkennen", "verb"],
    ["to expect", "erwarten", "verb"],
    ["to assume", "vermuten", "verb"],
    ["to change", "ändern", "verb"],
    ["to manage", "schaffen", "verb"],
    ["to fail", "scheitern", "verb"],
    ["to succeed", "gelingen", "verb"],
    ["to influence", "beeinflussen", "verb"],
    ["to affect", "betreffen", "verb"],
    ["to describe", "beschreiben", "verb"],
    ["to summarize", "zusammenfassen", "verb"],
    ["important", "wichtig", "adjective"],
    ["unimportant", "unwichtig", "adjective"],
    ["clear", "eindeutig", "adjective"],
    ["unclear", "unklar", "adjective"],
    ["complicated", "kompliziert", "adjective"],
    ["simple", "einfach", "adjective"],
    ["typical", "typisch", "adjective"],
    ["rare", "selten", "adjective"],
    ["frequent", "häufig", "adjective"],
    ["regularly", "regelmäßig", "adverb"],
    ["occasionally", "gelegentlich", "adverb"],
    ["basically", "grundsätzlich", "adverb"],
    ["exactly", "genau", "adverb"],
    ["approximately", "ungefähr", "adverb"],
    ["immediately", "sofort", "adverb"],
    ["later", "später", "adverb"],
  ]),
  ...packStarterWords("alltag", "B1", [
    ["the bank", "die Bank", "noun"],
    ["the cash", "das Bargeld", "noun"],
    ["the card", "die Karte", "noun"],
    ["the debit card", "die EC-Karte", "noun"],
    ["the credit card", "die Kreditkarte", "noun"],
    ["the account balance", "der Kontostand", "noun"],
    ["the payment", "die Zahlung", "noun"],
    ["the direct debit", "die Lastschrift", "noun"],
    ["the installment", "die Rate", "noun"],
    ["the amount", "der Betrag", "noun"],
    ["the tax", "die Steuer", "noun"],
    ["the fee in daily life", "die Gebühr", "noun"],
    ["the reminder fee", "die Mahngebühr", "noun"],
    ["the subscription", "das Abo", "noun"],
    ["the contract cancellation", "die Vertragskündigung", "noun"],
    ["the customer service", "der Kundenservice", "noun"],
    ["the password", "das Passwort", "noun"],
    ["the username", "der Benutzername", "noun"],
    ["the app", "die App", "noun"],
    ["the website", "die Webseite", "noun"],
    ["the login", "die Anmeldung", "noun"],
    ["the connection online", "die Internetverbindung", "noun"],
    ["the data volume", "das Datenvolumen", "noun"],
    ["the mobile contract", "der Handyvertrag", "noun"],
    ["to transfer money", "Geld überweisen", "phrase"],
    ["to pay by card", "mit Karte bezahlen", "phrase"],
    ["to cancel a contract", "einen Vertrag kündigen", "phrase"],
    ["to log in", "sich anmelden", "verb"],
    ["to log out", "sich abmelden", "verb"],
    ["to download", "herunterladen", "verb"],
    ["to upload", "hochladen", "verb"],
    ["to save", "speichern", "verb"],
    ["to delete", "löschen", "verb"],
    ["to open", "öffnen", "verb"],
    ["to close", "schließen", "verb"],
    ["to send", "senden", "verb"],
    ["to receive", "empfangen", "verb"],
    ["digital", "digital", "adjective"],
    ["secure", "sicher", "adjective"],
    ["private", "privat", "adjective"],
    ["public", "öffentlich", "adjective"],
  ]),
  ...packStarterWords("arbeit", "B2", [
    ["the responsibility area", "der Verantwortungsbereich", "noun"],
    ["the leadership", "die Führung", "noun"],
    ["the management", "die Geschäftsführung", "noun"],
    ["the company", "das Unternehmen", "noun"],
    ["the department head", "die Abteilungsleitung", "noun"],
    ["the human resources department", "die Personalabteilung", "noun"],
    ["the job interview", "das Vorstellungsgespräch", "noun"],
    ["the cover letter", "das Anschreiben", "noun"],
    ["the resume", "der Lebenslauf", "noun"],
    ["the certificate at work", "das Zeugnis", "noun"],
    ["the reference", "die Referenz", "noun"],
    ["the position", "die Stelle", "noun"],
    ["the task area", "das Aufgabengebiet", "noun"],
    ["the working condition", "die Arbeitsbedingung", "noun"],
    ["the overtime", "die Überstunde", "noun"],
    ["the vacation day", "der Urlaubstag", "noun"],
    ["the sick note", "die Krankmeldung", "noun"],
    ["the payroll", "die Gehaltsabrechnung", "noun"],
    ["the tax class", "die Steuerklasse", "noun"],
    ["the social contribution", "der Sozialbeitrag", "noun"],
    ["the pension insurance", "die Rentenversicherung", "noun"],
    ["the unemployment insurance", "die Arbeitslosenversicherung", "noun"],
    ["the accident insurance", "die Unfallversicherung", "noun"],
    ["the employment agency", "die Arbeitsagentur", "noun"],
    ["the training program", "die Ausbildung", "noun"],
    ["the apprentice", "der Auszubildende", "noun", "Short form: der Azubi."],
    ["the qualification", "die Qualifikation", "noun"],
    ["the certificate of completion", "der Abschluss", "noun"],
    ["the responsibility handover", "die Übergabe", "noun"],
    ["the agreement", "die Vereinbarung", "noun"],
    ["the negotiation round", "die Verhandlungsrunde", "noun"],
    ["the budget", "das Budget", "noun"],
    ["the expense", "die Ausgabe", "noun"],
    ["the revenue", "der Umsatz", "noun"],
    ["the profit", "der Gewinn", "noun"],
    ["the loss", "der Verlust", "noun"],
    ["the target group", "die Zielgruppe", "noun"],
    ["the market", "der Markt", "noun"],
    ["the offer as proposal", "das Angebot", "noun"],
    ["the proposal", "das Angebotsschreiben", "noun"],
    ["the invoice number", "die Rechnungsnummer", "noun"],
    ["the due date", "das Fälligkeitsdatum", "noun"],
    ["to apply for a job", "sich auf eine Stelle bewerben", "phrase"],
    ["to arrange a meeting", "einen Termin vereinbaren", "phrase"],
    ["to take responsibility", "Verantwortung übernehmen", "phrase"],
    ["to hand over", "übergeben", "verb"],
    ["to delegate", "delegieren", "verb"],
    ["to clarify", "klären", "verb"],
    ["to coordinate", "abstimmen", "verb"],
    ["to implement", "umsetzen", "verb"],
    ["to document", "dokumentieren", "verb"],
    ["to evaluate", "bewerten", "verb"],
    ["to estimate", "einschätzen", "verb"],
    ["to request", "anfordern", "verb"],
    ["to approve at work", "freigeben", "verb"],
    ["to reject a proposal", "ablehnen", "verb"],
    ["independent", "eigenständig", "adjective"],
    ["responsible", "verantwortlich", "adjective"],
    ["efficient", "effizient", "adjective"],
    ["transparent", "transparent", "adjective"],
    ["binding", "verbindlich", "adjective"],
  ]),
  ...packStarterWords("alltag", "B2", [
    ["the consumer", "der Verbraucher", "noun", "Female: die Verbraucherin."],
    ["the consumer protection", "der Verbraucherschutz", "noun"],
    ["the membership", "die Mitgliedschaft", "noun"],
    ["the notice period", "die Kündigungsfrist", "noun"],
    ["the cancellation confirmation", "die Kündigungsbestätigung", "noun"],
    ["the subscription fee", "der Mitgliedsbeitrag", "noun"],
    ["the security deposit", "die Sicherheitsleistung", "noun"],
    ["the insurance policy", "die Versicherungspolice", "noun"],
    ["the claim", "der Anspruch", "noun"],
    ["the support hotline", "die Hotline", "noun"],
    ["the waiting loop", "die Warteschleife", "noun"],
    ["the callback", "der Rückruf", "noun"],
    ["the replacement device", "das Ersatzgerät", "noun"],
    ["the warranty claim", "der Garantiefall", "noun"],
    ["the defect", "der Mangel", "noun"],
    ["the complaint department", "die Reklamationsabteilung", "noun"],
    ["the refund", "die Erstattung", "noun"],
    ["the voucher", "der Gutschein", "noun"],
    ["the confirmation", "die Bestätigung", "noun"],
    ["the notification", "die Benachrichtigung", "noun"],
    ["the setting", "die Einstellung", "noun"],
    ["the permission", "die Berechtigung", "noun"],
    ["the privacy", "die Privatsphäre", "noun"],
    ["the data protection", "der Datenschutz", "noun"],
    ["the terms and conditions", "die AGB", "noun", "Short for Allgemeine Geschäftsbedingungen."],
    ["the password reset", "das Zurücksetzen des Passworts", "phrase"],
    ["the confirmation code", "der Bestätigungscode", "noun"],
    ["the device", "das Gerät", "noun"],
    ["the charger", "das Ladegerät", "noun"],
    ["the screen", "der Bildschirm", "noun"],
    ["the keyboard", "die Tastatur", "noun"],
    ["the mouse", "die Maus", "noun"],
    ["the headphones", "die Kopfhörer", "noun"],
    ["the receipt number", "die Belegnummer", "noun"],
    ["the delivery address", "die Lieferadresse", "noun"],
    ["the billing address", "die Rechnungsadresse", "noun"],
    ["to complain about goods", "reklamieren", "verb"],
    ["to request a refund", "eine Erstattung beantragen", "phrase"],
    ["to confirm", "bestätigen", "verb"],
    ["to activate", "aktivieren", "verb"],
    ["to deactivate", "deaktivieren", "verb"],
    ["to update", "aktualisieren", "verb"],
    ["to connect", "verbinden", "verb"],
    ["to disconnect", "trennen", "verb"],
    ["to reset", "zurücksetzen", "verb"],
    ["to enter a code", "einen Code eingeben", "phrase"],
    ["to scan", "scannen", "verb"],
    ["to print out", "ausdrucken", "verb"],
    ["to request support", "Support anfordern", "phrase"],
    ["available online", "online verfügbar", "phrase"],
    ["out of stock", "nicht vorrätig", "phrase"],
  ]),
  ...packStarterWords("gesundheit", "B2", [
    ["the blood pressure", "der Blutdruck", "noun"],
    ["the blood test", "die Blutuntersuchung", "noun"],
    ["the laboratory result", "der Laborwert", "noun"],
    ["the medical finding", "der Befund", "noun"],
    ["the infection", "die Infektion", "noun"],
    ["the inflammation", "die Entzündung", "noun"],
    ["the wound", "die Wunde", "noun"],
    ["the injury", "die Verletzung", "noun"],
    ["the fracture", "der Bruch", "noun"],
    ["the swelling", "die Schwellung", "noun"],
    ["the rash", "der Ausschlag", "noun"],
    ["the side effect", "die Nebenwirkung", "noun"],
    ["the dosage", "die Dosierung", "noun"],
    ["the package leaflet", "die Packungsbeilage", "noun"],
    ["the emergency service", "der Notdienst", "noun"],
    ["the ambulance", "der Krankenwagen", "noun"],
    ["the caregiver", "die Pflegekraft", "noun"],
    ["the care insurance", "die Pflegeversicherung", "noun"],
    ["the mental health", "die psychische Gesundheit", "noun"],
    ["the therapy appointment", "der Therapietermin", "noun"],
    ["the stress symptom", "das Stresssymptom", "noun"],
    ["the sleep problem", "das Schlafproblem", "noun"],
    ["the nutrition", "die Ernährung", "noun"],
    ["the movement", "die Bewegung", "noun"],
    ["the prevention", "die Vorsorge", "noun"],
    ["the checkup", "die Vorsorgeuntersuchung", "noun"],
    ["to make an appointment with a specialist", "einen Facharzttermin vereinbaren", "phrase"],
    ["to describe symptoms", "Symptome beschreiben", "phrase"],
    ["to tolerate medicine", "ein Medikament vertragen", "phrase"],
    ["to stop taking medicine", "ein Medikament absetzen", "phrase"],
    ["to cool a wound", "eine Wunde kühlen", "phrase"],
    ["to disinfect", "desinfizieren", "verb"],
    ["to bandage", "verbinden", "verb"],
    ["to diagnose", "diagnostizieren", "verb"],
    ["to prevent", "vorbeugen", "verb"],
    ["to reduce stress", "Stress abbauen", "phrase"],
    ["chronic", "chronisch", "adjective"],
    ["acute", "akut", "adjective"],
    ["painful", "schmerzhaft", "adjective"],
    ["harmless", "harmlos", "adjective"],
    ["serious", "ernst", "adjective"],
    ["insured", "versichert", "adjective"],
    ["private health insured", "privat versichert", "phrase"],
    ["statutory health insured", "gesetzlich versichert", "phrase"],
  ]),
  ...packStarterWords("behörden", "B2", [
    ["the social security number", "die Sozialversicherungsnummer", "noun"],
    ["the pension notice", "der Rentenbescheid", "noun"],
    ["the contribution statement", "die Beitragsbescheinigung", "noun"],
    ["the employment certificate", "die Arbeitsbescheinigung", "noun"],
    ["the certificate of good conduct", "das Führungszeugnis", "noun"],
    ["the residence registration", "die Wohnsitzanmeldung", "noun"],
    ["the deregistration confirmation", "die Abmeldebestätigung", "noun"],
    ["the change of address", "die Adressänderung", "noun"],
    ["the civil registry office", "das Standesamt", "noun"],
    ["the marriage certificate", "die Heiratsurkunde", "noun"],
    ["the driving license office", "die Führerscheinstelle", "noun"],
    ["the vehicle registration office", "die Zulassungsstelle", "noun"],
    ["the registration certificate for car", "die Zulassungsbescheinigung", "noun"],
    ["the license plate", "das Kennzeichen", "noun"],
    ["the fine", "das Bußgeld", "noun"],
    ["the objection", "der Widerspruch", "noun"],
    ["the deadline extension", "die Fristverlängerung", "noun"],
    ["the processing fee", "die Bearbeitungsgebühr", "noun"],
    ["the appointment booking", "die Terminbuchung", "noun"],
    ["the online application", "der Online-Antrag", "noun"],
    ["the user account", "das Nutzerkonto", "noun"],
    ["the consent", "die Zustimmung", "noun"],
    ["the power of attorney", "die Vollmacht", "noun"],
    ["the authorized person", "die bevollmächtigte Person", "noun"],
    ["the original document", "das Originaldokument", "noun"],
    ["the missing document", "die fehlende Unterlage", "noun"],
    ["the certified copy", "die beglaubigte Kopie", "noun"],
    ["the sworn translation", "die beglaubigte Übersetzung", "noun"],
    ["to submit later", "nachreichen", "verb"],
    ["to make an objection", "Widerspruch einlegen", "phrase"],
    ["to extend a deadline", "eine Frist verlängern", "phrase"],
    ["to book an appointment", "einen Termin buchen", "phrase"],
    ["to upload documents", "Unterlagen hochladen", "phrase"],
    ["to prove identity", "die Identität nachweisen", "phrase"],
    ["to authorize someone", "jemanden bevollmächtigen", "phrase"],
    ["to register a car", "ein Auto zulassen", "phrase"],
    ["to pay a fine", "ein Bußgeld bezahlen", "phrase"],
    ["subject to approval", "genehmigungspflichtig", "adjective"],
    ["liable to pay contributions", "beitragspflichtig", "adjective"],
    ["taxable", "steuerpflichtig", "adjective"],
    ["valid until", "gültig bis", "phrase"],
    ["retroactive", "rückwirkend", "adjective"],
    ["legally binding", "rechtsverbindlich", "adjective"],
    ["responsible authority", "zuständige Behörde", "phrase"],
  ]),
  ...packStarterWords("freizeit", "B2", [
    ["the event", "die Veranstaltung", "noun"],
    ["the guided tour", "die Führung", "noun"],
    ["the entrance fee", "der Eintritt", "noun"],
    ["the ticket reservation", "die Kartenreservierung", "noun"],
    ["the seat", "der Sitzplatz", "noun"],
    ["the standing room", "der Stehplatz", "noun"],
    ["the stage", "die Bühne", "noun"],
    ["the audience", "das Publikum", "noun"],
    ["the performance", "die Aufführung", "noun"],
    ["the review", "die Bewertung", "noun"],
    ["the recommendation", "die Empfehlung", "noun"],
    ["the destination", "das Reiseziel", "noun"],
    ["the luggage", "das Gepäck", "noun"],
    ["the suitcase", "der Koffer", "noun"],
    ["the backpack", "der Rucksack", "noun"],
    ["the boarding pass", "die Bordkarte", "noun"],
    ["the accommodation booking", "die Unterkunftsbuchung", "noun"],
    ["the cancellation fee", "die Stornogebühr", "noun"],
    ["the travel insurance", "die Reiseversicherung", "noun"],
    ["the sightseeing", "die Besichtigung", "noun"],
    ["the menu", "die Speisekarte", "noun"],
    ["the starter", "die Vorspeise", "noun"],
    ["the main course", "das Hauptgericht", "noun"],
    ["the dessert", "die Nachspeise", "noun"],
    ["the tip", "das Trinkgeld", "noun"],
    ["the ingredient", "die Zutat", "noun"],
    ["the allergy information", "der Allergiehinweis", "noun"],
    ["to attend an event", "eine Veranstaltung besuchen", "phrase"],
    ["to reserve seats", "Sitzplätze reservieren", "phrase"],
    ["to recommend", "empfehlen", "verb"],
    ["to rate", "bewerten", "verb"],
    ["to cancel a booking", "eine Buchung stornieren", "phrase"],
    ["to check in", "einchecken", "verb"],
    ["to check out", "auschecken", "verb"],
    ["to pack", "packen", "verb"],
    ["to unpack", "auspacken", "verb"],
    ["to order food", "Essen bestellen", "phrase"],
    ["to split the bill", "die Rechnung teilen", "phrase"],
    ["to leave a tip", "Trinkgeld geben", "phrase"],
    ["included", "inbegriffen", "adjective"],
    ["not included", "nicht inbegriffen", "phrase"],
    ["recommended", "empfehlenswert", "adjective"],
    ["worth seeing", "sehenswert", "adjective"],
    ["fully booked out", "ausverkauft", "adjective"],
  ]),
  ...packStarterWords("abstrakt", "B2", [
    ["the argument", "das Argument", "noun"],
    ["the counterargument", "das Gegenargument", "noun"],
    ["the claim", "die Behauptung", "noun"],
    ["the assumption", "die Annahme", "noun"],
    ["the conclusion", "die Schlussfolgerung", "noun"],
    ["the perspective", "die Perspektive", "noun"],
    ["the point of view", "der Standpunkt", "noun"],
    ["the compromise", "der Kompromiss", "noun"],
    ["the conflict", "der Konflikt", "noun"],
    ["the influence", "der Einfluss", "noun"],
    ["the impact", "die Auswirkung", "noun"],
    ["the measure", "die Maßnahme", "noun"],
    ["the risk", "das Risiko", "noun"],
    ["the chance", "die Chance", "noun"],
    ["the challenge", "die Herausforderung", "noun"],
    ["the demand", "die Forderung", "noun"],
    ["the supply", "das Angebot", "noun"],
    ["the need", "der Bedarf", "noun"],
    ["the society", "die Gesellschaft", "noun"],
    ["the population", "die Bevölkerung", "noun"],
    ["the integration", "die Integration", "noun"],
    ["the education", "die Bildung", "noun"],
    ["the equality", "die Gleichberechtigung", "noun"],
    ["the sustainability", "die Nachhaltigkeit", "noun"],
    ["the climate protection", "der Klimaschutz", "noun"],
    ["the energy", "die Energie", "noun"],
    ["the renewable energy", "die erneuerbare Energie", "noun"],
    ["the consumption", "der Verbrauch", "noun"],
    ["the resource", "die Ressource", "noun"],
    ["the waste", "der Abfall", "noun"],
    ["the pollution", "die Verschmutzung", "noun"],
    ["the responsibility in society", "die Verantwortung", "noun"],
    ["the participation", "die Beteiligung", "noun"],
    ["the decision making", "die Entscheidungsfindung", "noun"],
    ["the requirement in general", "die Anforderung", "noun"],
    ["to claim", "behaupten", "verb"],
    ["to assume", "annehmen", "verb"],
    ["to conclude", "schlussfolgern", "verb"],
    ["to point out", "hinweisen auf", "phrase"],
    ["to emphasize", "betonen", "verb"],
    ["to criticize", "kritisieren", "verb"],
    ["to support", "unterstützen", "verb"],
    ["to demand", "fordern", "verb"],
    ["to promote", "fördern", "verb"],
    ["to prevent", "verhindern", "verb"],
    ["to enable", "ermöglichen", "verb"],
    ["to limit", "einschränken", "verb"],
    ["to increase", "erhöhen", "verb"],
    ["to reduce", "verringern", "verb"],
    ["to replace", "ersetzen", "verb"],
    ["to participate", "sich beteiligen", "verb"],
    ["to contribute", "beitragen", "verb"],
    ["to take into account", "berücksichtigen", "verb"],
    ["to distinguish", "unterscheiden", "verb"],
    ["to relate to", "sich beziehen auf", "phrase"],
    ["convincing", "überzeugend", "adjective"],
    ["controversial", "umstritten", "adjective"],
    ["sustainable", "nachhaltig", "adjective"],
    ["social", "sozial", "adjective"],
    ["economic", "wirtschaftlich", "adjective"],
    ["political", "politisch", "adjective"],
    ["legal", "rechtlich", "adjective"],
    ["environmentally friendly", "umweltfreundlich", "adjective"],
    ["limited", "begrenzt", "adjective"],
    ["necessary in general", "erforderlich", "adjective"],
    ["on the one hand", "einerseits", "adverb"],
    ["on the other hand", "andererseits", "adverb"],
    ["in addition", "außerdem", "adverb"],
    ["however", "allerdings", "adverb"],
    ["nevertheless", "dennoch", "adverb"],
    ["consequently", "folglich", "adverb"],
  ]),
  ...packStarterWords("alltag", "B1", [
    ["the appointment reminder", "die Terminerinnerung", "noun"],
    ["the waiting room", "das Wartezimmer", "noun"],
    ["the entrance", "der Eingang", "noun"],
    ["the exit from a building", "der Ausgang", "noun"],
    ["the floor in a building", "die Etage", "noun"],
    ["the stairs", "die Treppe", "noun"],
    ["the information desk", "die Information", "noun"],
    ["the sign", "das Schild", "noun"],
    ["the instruction", "die Anweisung", "noun"],
    ["the notice", "der Hinweis", "noun"],
    ["the opening time", "die Öffnungszeit", "noun"],
    ["the closing time", "die Schließzeit", "noun"],
    ["the lost property office", "das Fundbüro", "noun"],
    ["the lost item", "der verlorene Gegenstand", "noun"],
    ["the emergency exit", "der Notausgang", "noun"],
    ["the meeting point", "der Treffpunkt", "noun"],
    ["to stand in line", "sich anstellen", "verb"],
    ["to ask for directions", "nach dem Weg fragen", "phrase"],
    ["to follow a sign", "einem Schild folgen", "phrase"],
    ["to show an ID", "einen Ausweis zeigen", "phrase"],
    ["to pick something up", "etwas abholen", "phrase"],
    ["to drop something off", "etwas abgeben", "phrase"],
    ["to be on time", "rechtzeitig da sein", "phrase"],
    ["nearby", "in der Nähe", "phrase"],
    ["on the left", "auf der linken Seite", "phrase"],
    ["on the right", "auf der rechten Seite", "phrase"],
  ]),
];

const memoryTricks = [
  ["vergessen", "ver-GESSEN: you ate it, then forgot you ate it."],
  ["verhandeln", "Handeln is dealing/trading; picture two hands trading offers across a table."],
  ["die Verantwortung", "Antwort means answer; Verantwortung is what you must answer for."],
  ["verschieben", "Picture sliding a meeting sideways on your calendar: schieben = push."],
  ["zuverlässig", "Zuverlässig people let you rely on them, every single time."],
  ["die Behörde", "A Behörde is where paperwork gets heard, stamped, and slowly judged."],
  ["ausfüllen", "Fill the form until it is full: aus-füllen."],
  ["einreichen", "Reach your paper in across the counter: ein-reichen."],
  ["die Verspätung", "Spät means late; Verspätung is lateness with a train announcement voice."],
  ["umsteigen", "Steigen is step/climb; umsteigen is stepping over to another train."],
  ["die Fähigkeit", "Fähig means capable; die Fähigkeit is the capability or skill you can use."],
  ["der Vermieter", "Mieten means to rent; der Vermieter is the person renting the place out to you."],
  ["der Kassenzettel", "Kasse = checkout, Zettel = slip; the receipt is the checkout slip."],
  ["der Termin", "A Termin is a fixed time slot; imagine pinning the appointment to a calendar."],
  ["die Bewerbung", "Werben means to promote/advertise; in a Bewerbung, you promote yourself."],
  ["die Stellenausschreibung", "Stelle = position, Ausschreibung = posting; the position is written out publicly."],
  ["das Gehalt", "Gehalt sounds like what your account gets held up by every month: salary."],
  ["der Vertrag", "A Vertrag is something both sides have to tragen/carry: the contract."],
  ["die Besprechung", "Sprechen is speaking; die Besprechung is the official speaking session."],
  ["die Aufgabe", "Aufgeben can mean to give up or hand in; die Aufgabe is the task handed to you."],
  ["die Frist", "A Frist feels like a tight fist around your calendar: deadline."],
  ["die Erfahrung", "Fahren is to travel; Erfahrung is what you gather by traveling through life."],
  ["die Wohnung", "Wohnen means to live; die Wohnung is the place where living happens."],
  ["die Miete", "Miete is the money you meet every month for your apartment."],
  ["der Mieter", "Mieten means to rent; der Mieter is the renter."],
  ["die Heizung", "Heizen means to heat; die Heizung is the heating system."],
  ["die Wäsche", "Wäsche sounds like wash; it is the laundry waiting for judgment."],
  ["der Müll", "Müll is the stuff you want to move out: garbage."],
  ["der Supermarkt", "Supermarkt is almost English: super market, but German gives it der."],
  ["der Rabatt", "A Rabatt cuts the price down like a rabbit nibbling the tag."],
  ["die Schlange", "A queue snakes around the shop; Schlange also means snake."],
  ["die Stimmung", "Stimme is voice; Stimmung is the emotional voice of the room."],
  ["die Angst", "Angst is already an English loanword: fear with German volume."],
  ["der Bahnhof", "Bahn = train, Hof = yard; der Bahnhof is the train yard/station."],
  ["der Bahnsteig", "Bahn = train, Steig = step/path; step onto the train platform."],
  ["der Ersatzbus", "Ersatz means replacement; der Ersatzbus is the replacement bus."],
  ["der Fahrkartenautomat", "Fahrkarte = ticket, Automat = machine; the ticket machine is built into the word."],
  ["die Monatskarte", "Monat = month, Karte = card; die Monatskarte is your monthly card/pass."],
  ["der Fahrradweg", "Fahrrad = bike, Weg = path; der Fahrradweg is the bike path."],
  ["die Kreuzung", "Kreuz means cross; die Kreuzung is where roads cross."],
  ["die Krankenversicherung", "Krank = sick, Versicherung = insurance; sick-insurance is health insurance."],
  ["der Arzttermin", "Arzt = doctor, Termin = appointment; der Arzttermin is the doctor appointment."],
  ["das Rezept", "Rezept is either prescription or recipe; the context decides the medicine or the meal."],
  ["die Apotheke", "Apotheke has the old pharmacy feel; think medicine shelves, not a supermarket."],
  ["der Schmerz", "Schmerz sounds sharp; der Schmerz is pain."],
  ["das Fieber", "Fieber sounds like fever; just remember German makes it das."],
  ["die Krankschreibung", "Krank = sick, Schreibung = written note; sick leave is written proof."],
  ["das Bürgeramt", "Bürger = citizen, Amt = office; das Bürgeramt is the citizen office."],
  ["die Anmeldung", "Anmelden means to register; die Anmeldung is the registration."],
  ["der Aufenthaltstitel", "Aufenthalt = stay, Titel = title/document; it is your official stay-title."],
  ["das Dokument", "Dokument looks like document; German locks it in as das."],
  ["das Formular", "Formular looks like form; the form itself is das Formular."],
  ["der Nachweis", "Nachweisen means to prove; der Nachweis is the proof you show afterward."],
  ["die Freizeit", "Frei = free, Zeit = time; die Freizeit is free time."],
  ["die Wanderung", "Wandern = to hike; die Wanderung is the hike."],
  ["der Verein", "Ein Verein unites people around a club or association."],
  ["die Ausstellung", "Ausstellen means to exhibit; die Ausstellung is the exhibition."],
  ["die Einladung", "Einladen means to invite; die Einladung is the invitation."],
  ["die Meinung", "Meinen means to mean/think; die Meinung is what you think."],
  ["die Entscheidung", "Scheiden means to separate; Entscheidung separates one option from the rest."],
  ["die Lösung", "Lösen means to solve; die Lösung is the solution."],
  ["der Grund", "Grund is the ground underneath an argument: the reason."],
  ["der Vorteil", "Vor = before/ahead, Teil = part; der Vorteil is the part that puts you ahead."],
  ["der Nachteil", "Nach = after/behind, Teil = part; der Nachteil is the part that puts you behind."],
  ["die Beschwerde", "Schwer means heavy; a complaint is the heavy thing you bring up."],
  ["die Umwelt", "Um = around, Welt = world; Umwelt is the world around you."],
  ["die Mülltrennung", "Müll = trash, Trennung = separation; die Mülltrennung is trash separation."],
  ["die Nachbarschaft", "Nachbar = neighbor; Nachbarschaft is the neighborhood."],
  ["der Unfall", "Fall is a fall/case; an Unfall is the bad fall/event: accident."],
  ["die Versicherung", "Sicher means safe; Versicherung is the thing that makes risk safer."],
  ["der Schaden", "Schaden is damage or harm; think schade, but worse."],
  ["das Werkzeug", "Werk = work, Zeug = stuff; das Werkzeug is work-stuff: a tool."],
  ["die Voraussetzung", "Voraus = ahead, Setzung = setting; a prerequisite is set ahead of time."],
  ["die Weiterbildung", "Weiter = further, Bildung = education; Weiterbildung is further training."],
  ["die Rechnung", "Rechnen means to calculate; die Rechnung is the calculated bill/invoice."],
  ["die Überweisung", "Überweisen means to transfer; die Überweisung moves money over."],
  ["das Konto", "Konto looks like account; German keeps bank accounts as das Konto."],
  ["sich bewerben", "In sich bewerben, you apply by presenting yourself: ich bewerbe mich."],
  ["erledigen", "Erledigt means done; erledigen is to get it done."],
  ["teilnehmen", "Teil = part, nehmen = take; teilnehmen means to take part."],
  ["absagen", "Absagen is to say it off: cancel."],
  ["sich beschweren", "Schwer means heavy; when you complain, you unload something heavy."],
  ["zustimmen", "Stimme = voice; zustimmen means to add your voice in agreement."],
  ["widersprechen", "Wider = against, sprechen = speak; disagreeing is speaking against."],
  ["vergleichen", "Gleich means same; vergleichen means checking what is same or different."],
  ["abhängen von", "Hängen means hang; if it depends on X, it hangs from X."],
  ["sich erinnern", "Erinnern pulls something back into your inner memory."],
  ["anbieten", "Bieten means to offer/bid; anbieten is to offer something to someone."],
  ["Geld abheben", "Abheben is lift off; at the ATM your money lifts out."],
];

const dailyPhrases = [
  { de: "Ich drücke dir die Daumen.", en: "I'm keeping my fingers crossed for you.", note: "Say it before an exam, interview, or any moment that needs luck." },
  { de: "Alles im grünen Bereich.", en: "Everything is okay.", note: "Useful when things are under control." },
  { de: "Das kriegen wir hin.", en: "We'll manage it.", note: "Calm confidence when something looks tricky." },
  { de: "Jetzt erst recht.", en: "Now more than ever.", note: "A stubborn little motivation phrase after a setback." },
  { de: "Ich bin ganz Ohr.", en: "I'm all ears.", note: "Use it when you're ready to listen." },
  { de: "Das ist halb so wild.", en: "It's not that bad.", note: "Good for calming a situation down." },
  { de: "Kommt Zeit, kommt Rat.", en: "Time will tell.", note: "A classic phrase when the answer is not obvious yet." },
  { de: "Lass uns loslegen.", en: "Let's get started.", note: "Perfect before beginning a task." },
  { de: "Das passt mir gut.", en: "That works well for me.", note: "Useful for planning appointments." },
  { de: "Das passt mir leider nicht.", en: "Unfortunately, that doesn't work for me.", note: "Polite scheduling phrase." },
  { de: "Ich melde mich später.", en: "I'll get back to you later.", note: "Common in work and everyday chats." },
  { de: "Klingt gut.", en: "Sounds good.", note: "Short, natural agreement." },
  { de: "Das klingt vernünftig.", en: "That sounds reasonable.", note: "Useful in discussions." },
  { de: "Ich habe es eilig.", en: "I'm in a hurry.", note: "Everyday phrase for time pressure." },
  { de: "Kein Stress.", en: "No stress.", note: "Casual way to say no pressure." },
  { de: "Mach dir keinen Kopf.", en: "Don't worry about it.", note: "Friendly reassurance." },
  { de: "Das kann passieren.", en: "That can happen.", note: "Softens a mistake." },
  { de: "Ich habe mich vertan.", en: "I made a mistake.", note: "Natural way to correct yourself." },
  { de: "Da bin ich mir nicht sicher.", en: "I'm not sure about that.", note: "Useful when you need thinking time." },
  { de: "Das kommt darauf an.", en: "It depends.", note: "One of the most useful discussion phrases." },
  { de: "Ehrlich gesagt...", en: "Honestly...", note: "Use before giving your real opinion." },
  { de: "Meiner Meinung nach...", en: "In my opinion...", note: "Classic B1/B2 opinion starter." },
  { de: "Soweit ich weiß...", en: "As far as I know...", note: "Good when you're not fully certain." },
  { de: "Ich gehe davon aus.", en: "I assume so.", note: "Useful in work conversations." },
  { de: "Das sehe ich anders.", en: "I see that differently.", note: "Polite disagreement." },
  { de: "Da hast du recht.", en: "You're right about that.", note: "Simple agreement." },
  { de: "Das ergibt Sinn.", en: "That makes sense.", note: "Very common feedback phrase." },
  { de: "Das lohnt sich.", en: "It's worth it.", note: "Use for effort, money, or time." },
  { de: "Das lohnt sich nicht.", en: "It's not worth it.", note: "The negative version is just as useful." },
  { de: "Ich schaffe das.", en: "I can manage that.", note: "Good self-talk and practical German." },
  { de: "Schauen wir mal.", en: "Let's see.", note: "Casual, flexible response." },
  { de: "Mal sehen.", en: "We'll see.", note: "Shorter version of let's see." },
  { de: "Ich bin dabei.", en: "I'm in.", note: "Use when joining a plan." },
  { de: "Ich bin raus.", en: "I'm out.", note: "Casual way to decline." },
  { de: "Das ist mir egal.", en: "I don't care.", note: "Can sound direct, so use carefully." },
  { de: "Mir ist das wichtig.", en: "That matters to me.", note: "Useful for priorities." },
  { de: "Das ist mir aufgefallen.", en: "I noticed that.", note: "Great for work feedback." },
  { de: "Ich komme gleich.", en: "I'll be right there.", note: "Everyday phrase at home or work." },
  { de: "Ich bin gleich da.", en: "I'll be there soon.", note: "Common when you're on the way." },
  { de: "Ich bin unterwegs.", en: "I'm on my way.", note: "Useful over text." },
  { de: "Es dauert noch.", en: "It will still take a while.", note: "Helpful when something is delayed." },
  { de: "Das dauert nicht lange.", en: "That won't take long.", note: "A practical reassurance." },
  { de: "Ich habe keine Ahnung.", en: "I have no idea.", note: "Natural and common." },
  { de: "Gute Frage.", en: "Good question.", note: "Buys you time while thinking." },
  { de: "Ich schaue kurz nach.", en: "I'll quickly check.", note: "Very useful at work." },
  { de: "Ich gebe dir Bescheid.", en: "I'll let you know.", note: "Common after checking something." },
  { de: "Sag mir einfach Bescheid.", en: "Just let me know.", note: "Friendly planning phrase." },
  { de: "Melde dich, wenn du Zeit hast.", en: "Message me when you have time.", note: "Useful with friends or colleagues." },
  { de: "Ich bin erreichbar.", en: "I'm reachable.", note: "Useful for work availability." },
  { de: "Ich bin gerade beschäftigt.", en: "I'm busy right now.", note: "Polite enough for daily use." },
  { de: "Ich habe Feierabend.", en: "I'm done with work for the day.", note: "A very German life phrase." },
  { de: "Das steht noch nicht fest.", en: "That hasn't been decided yet.", note: "Useful for plans and schedules." },
  { de: "Das ist schon erledigt.", en: "That's already done.", note: "Satisfying work phrase." },
  { de: "Ich kümmere mich darum.", en: "I'll take care of it.", note: "Strong work phrase." },
  { de: "Das hat sich erledigt.", en: "That sorted itself out.", note: "When an issue is no longer relevant." },
  { de: "Das ist nicht mein Bereich.", en: "That's not my area.", note: "Useful at work." },
  { de: "Ich leite es weiter.", en: "I'll forward it.", note: "Common email/work phrase." },
  { de: "Kannst du das übernehmen?", en: "Can you take that over?", note: "Asking someone to handle a task." },
  { de: "Ich bin überfragt.", en: "I don't know the answer.", note: "Literally: I'm over-questioned." },
  { de: "Das ist mir neu.", en: "That's new to me.", note: "Useful when hearing new information." },
  { de: "Ich habe den Überblick verloren.", en: "I've lost track.", note: "Helpful when things got confusing." },
  { de: "Alles der Reihe nach.", en: "One thing at a time.", note: "Great for slowing things down." },
  { de: "Nicht so schnell.", en: "Not so fast.", note: "Useful when someone speaks or moves too quickly." },
  { de: "Kannst du das wiederholen?", en: "Can you repeat that?", note: "Essential language-learning phrase." },
  { de: "Wie bitte?", en: "Sorry, what?", note: "Polite way to ask for repetition." },
  { de: "Ich habe dich nicht verstanden.", en: "I didn't understand you.", note: "Direct and useful." },
  { de: "Kannst du langsamer sprechen?", en: "Can you speak more slowly?", note: "Keep this one ready." },
  { de: "Was meinst du genau?", en: "What exactly do you mean?", note: "Clarifies meaning." },
  { de: "Das hängt zusammen.", en: "That's connected.", note: "Useful in explanations." },
  { de: "Das hängt davon ab.", en: "That depends on it.", note: "Good for conditions and decisions." },
  { de: "Ich habe daran gedacht.", en: "I thought of that.", note: "Useful for planning." },
  { de: "Ich habe es vergessen.", en: "I forgot it.", note: "Honest everyday phrase." },
  { de: "Das fällt mir schwer.", en: "That's difficult for me.", note: "Use for skills or emotions." },
  { de: "Das fällt mir leicht.", en: "That's easy for me.", note: "The positive opposite." },
  { de: "Ich gewöhne mich daran.", en: "I'm getting used to it.", note: "Great for life in a new country." },
  { de: "Ich bin daran gewöhnt.", en: "I'm used to it.", note: "Slightly more settled than getting used to it." },
  { de: "Das ist gewöhnungsbedürftig.", en: "That takes some getting used to.", note: "Very German and very useful." },
  { de: "Ich freue mich darauf.", en: "I'm looking forward to it.", note: "Use with events and plans." },
  { de: "Ich habe mich darauf gefreut.", en: "I was looking forward to it.", note: "Past version for plans." },
  { de: "Das ist schade.", en: "That's a pity.", note: "Simple empathy phrase." },
  { de: "Das tut mir leid.", en: "I'm sorry about that.", note: "For sympathy or apology." },
  { de: "Kein Problem.", en: "No problem.", note: "Easy and common." },
  { de: "Gern geschehen.", en: "You're welcome.", note: "Classic response to thanks." },
  { de: "Nichts zu danken.", en: "Don't mention it.", note: "A casual you're welcome." },
  { de: "Das war knapp.", en: "That was close.", note: "Useful after nearly missing something." },
  { de: "Zum Glück.", en: "Luckily.", note: "Short and very common." },
  { de: "Leider nicht.", en: "Unfortunately not.", note: "Polite negative answer." },
  { de: "Auf jeden Fall.", en: "Definitely.", note: "Strong agreement." },
  { de: "Auf keinen Fall.", en: "No way.", note: "Strong rejection." },
  { de: "Das geht gar nicht.", en: "That's not acceptable.", note: "Stronger than it doesn't work." },
  { de: "Das geht schon.", en: "It'll be okay.", note: "Flexible, casual reassurance." },
  { de: "Das klappt.", en: "That'll work.", note: "Useful for plans." },
  { de: "Das klappt nicht.", en: "That won't work.", note: "Clear and practical." },
  { de: "Ich habe Lust darauf.", en: "I feel like doing that.", note: "Use for wants and activities." },
  { de: "Ich habe keine Lust.", en: "I don't feel like it.", note: "Very everyday." },
  { de: "Ich bin gespannt.", en: "I'm curious / excited to see.", note: "Useful before seeing a result." },
  { de: "Das ist mir peinlich.", en: "That's embarrassing for me.", note: "Good emotional phrase." },
  { de: "Ich bin erleichtert.", en: "I'm relieved.", note: "Useful after stress." },
  { de: "Ich bin überfordert.", en: "I'm overwhelmed.", note: "Helpful and honest." },
  { de: "Ich brauche eine Pause.", en: "I need a break.", note: "Essential." },
  { de: "Ich brauche frische Luft.", en: "I need fresh air.", note: "Common everyday phrase." },
  { de: "Mir ist kalt.", en: "I'm cold.", note: "German uses mir ist, not ich bin." },
  { de: "Mir ist warm.", en: "I'm warm.", note: "Same structure as mir ist kalt." },
  { de: "Mir ist schwindelig.", en: "I feel dizzy.", note: "Useful health phrase." },
  { de: "Mir ist übel.", en: "I feel nauseous.", note: "Useful at the doctor." },
  { de: "Ich habe Kopfschmerzen.", en: "I have a headache.", note: "Common health phrase." },
  { de: "Ich bin krankgeschrieben.", en: "I'm on sick leave.", note: "Useful in Germany." },
  { de: "Ich habe einen Termin.", en: "I have an appointment.", note: "Works for doctors, offices, meetings." },
  { de: "Ich möchte einen Termin vereinbaren.", en: "I'd like to make an appointment.", note: "Essential for calls." },
  { de: "Ich möchte den Termin verschieben.", en: "I'd like to reschedule the appointment.", note: "Very practical." },
  { de: "Ich habe mich verlaufen.", en: "I got lost.", note: "On foot." },
  { de: "Ich habe mich verfahren.", en: "I drove/went the wrong way.", note: "For car, bike, or transit routes." },
  { de: "Ich muss umsteigen.", en: "I have to change trains.", note: "Transit essential." },
  { de: "Der Zug hat Verspätung.", en: "The train is delayed.", note: "Classic Germany survival phrase." },
  { de: "Ich habe den Zug verpasst.", en: "I missed the train.", note: "Painful but useful." },
  { de: "Wo muss ich aussteigen?", en: "Where do I have to get off?", note: "Useful when asking for directions." },
  { de: "Ist der Platz noch frei?", en: "Is this seat still free?", note: "Train and cafe phrase." },
  { de: "Ich hätte gern...", en: "I would like...", note: "Polite ordering phrase." },
  { de: "Kann ich mit Karte zahlen?", en: "Can I pay by card?", note: "Still useful to ask." },
  { de: "Haben Sie eine Tüte?", en: "Do you have a bag?", note: "At shops." },
  { de: "Ich schaue mich nur um.", en: "I'm just looking around.", note: "Useful in stores." },
  { de: "Das ist mir zu teuer.", en: "That's too expensive for me.", note: "Shopping phrase." },
  { de: "Können Sie mir helfen?", en: "Can you help me?", note: "Polite with Sie." },
  { de: "Ich hätte eine Frage.", en: "I have a question.", note: "Polite opener at counters." },
  { de: "Ich brauche einen Nachweis.", en: "I need proof/documentation.", note: "Useful for bureaucracy." },
  { de: "Ich muss das Formular ausfüllen.", en: "I have to fill out the form.", note: "Bureaucracy survival." },
  { de: "Welche Unterlagen brauche ich?", en: "Which documents do I need?", note: "Very useful at offices." },
  { de: "Ich reiche es später ein.", en: "I'll submit it later.", note: "Good for missing paperwork." },
  { de: "Das ist noch gültig.", en: "That's still valid.", note: "For tickets, IDs, documents." },
  { de: "Das ist abgelaufen.", en: "That has expired.", note: "For documents and dates." },
  { de: "Ich wohne zur Miete.", en: "I rent my home.", note: "Housing phrase." },
  { de: "Die Heizung funktioniert nicht.", en: "The heating doesn't work.", note: "Important apartment phrase." },
  { de: "Der Wasserhahn tropft.", en: "The faucet is dripping.", note: "Household issue." },
  { de: "Ich muss den Müll rausbringen.", en: "I have to take out the trash.", note: "Everyday household phrase." },
  { de: "Ich räume kurz auf.", en: "I'll tidy up quickly.", note: "Useful at home." },
  { de: "Das ist mir aufgefallen.", en: "I noticed that.", note: "Works in home and work contexts." },
  { de: "Wir bleiben in Kontakt.", en: "We'll stay in touch.", note: "Friendly goodbye phrase." },
  { de: "Pass auf dich auf.", en: "Take care of yourself.", note: "Warm goodbye." },
  { de: "Bis gleich.", en: "See you in a bit.", note: "Sooner than bis später." },
  { de: "Bis später.", en: "See you later.", note: "Everyday goodbye." },
  { de: "Schönes Wochenende.", en: "Have a nice weekend.", note: "Friday classic." },
  { de: "Komm gut nach Hause.", en: "Get home safely.", note: "Warm and useful." },
];

const storyBank = [
  {
    id: "a1-supermarkt",
    level: "A1",
    topic: "alltag",
    title: "Mira im Supermarkt",
    intro: "A tiny shopping story with the words you actually need.",
    vocab: [
      ["the supermarket", "der Supermarkt"],
      ["the bread", "das Brot"],
      ["the cheese", "der Käse"],
      ["the water", "das Wasser"],
      ["to buy", "kaufen"],
      ["the money", "das Geld"],
    ],
    paragraphs: [
      "Mira geht am Morgen in den Supermarkt. Sie braucht Brot, Käse und Wasser.",
      "An der Kasse sucht Mira ihr Geld. Der Kassierer wartet ruhig.",
      "Mira findet das Geld in ihrer Tasche. Sie bezahlt und geht nach Hause.",
    ],
    questions: [
      { q: "Where does Mira go?", options: ["To the supermarket", "To the doctor", "To work", "To the station"], answer: 0 },
      { q: "What does Mira need?", options: ["Bread, cheese, and water", "Coffee and a ticket", "A form", "A new phone"], answer: 0 },
      { q: "What does Mira look for at the checkout?", options: ["Her money", "Her key", "Her ticket", "Her phone"], answer: 0 },
      { q: "Where is the money?", options: ["In her bag", "In the fridge", "At home", "On the bus"], answer: 0 },
    ],
  },
  {
    id: "a1-cafe",
    level: "A1",
    topic: "freizeit",
    title: "Ein Kaffee nach der Arbeit",
    intro: "A small cafe moment, simple and useful.",
    vocab: [
      ["the coffee", "der Kaffee"],
      ["the water", "das Wasser"],
      ["the friend", "der Freund"],
      ["the evening", "der Abend"],
      ["good", "gut"],
      ["to drink", "trinken"],
    ],
    paragraphs: [
      "Am Abend trifft Tom seinen Freund im Café. Tom trinkt Kaffee, sein Freund trinkt Wasser.",
      "Das Café ist klein, aber sehr gut. Die Musik ist ruhig.",
      "Tom sagt: \"Der Abend ist schön.\" Sein Freund lacht.",
    ],
    questions: [
      { q: "Who does Tom meet?", options: ["His friend", "His doctor", "His boss", "His landlord"], answer: 0 },
      { q: "What does Tom drink?", options: ["Coffee", "Milk", "Tea", "Juice"], answer: 0 },
      { q: "How is the cafe?", options: ["Small but good", "Big and loud", "Closed", "Very expensive"], answer: 0 },
      { q: "When does the story happen?", options: ["In the evening", "In the morning", "At night", "On Monday morning"], answer: 0 },
    ],
  },
  {
    id: "a2-key",
    level: "A2",
    topic: "alltag",
    title: "Der verlorene Schlüssel",
    intro: "The classic panic: key missing, appointment soon.",
    vocab: [
      ["the key", "der Schlüssel"],
      ["the appointment", "der Termin"],
      ["to search for", "suchen"],
      ["to find again", "wiederfinden"],
      ["the bag", "die Tasche"],
      ["nearby", "in der Nähe"],
    ],
    paragraphs: [
      "Nina hat um zehn Uhr einen Termin. Aber ihr Schlüssel ist nicht in der Tasche.",
      "Sie sucht im Flur, in der Küche und im Wohnzimmer. Dann ruft sie ihre Nachbarin an.",
      "Die Nachbarin sagt: \"Schau mal neben der Tür.\" Dort liegt der Schlüssel. Nina ist erleichtert.",
    ],
    questions: [
      { q: "What problem does Nina have?", options: ["She cannot find her key", "She missed the train", "She lost her wallet", "She is sick"], answer: 0 },
      { q: "Where does Nina search?", options: ["In several rooms", "Only outside", "At the station", "At work"], answer: 0 },
      { q: "Who does Nina call?", options: ["Her neighbor", "Her doctor", "Her landlord", "Her colleague"], answer: 0 },
      { q: "Where is the key?", options: ["Next to the door", "In the supermarket", "In the bus", "Under the bed"], answer: 0 },
    ],
  },
  {
    id: "a2-doctor",
    level: "A2",
    topic: "gesundheit",
    title: "Ein Termin beim Hausarzt",
    intro: "Simple doctor-visit language without drama.",
    vocab: [
      ["the doctor appointment", "der Arzttermin"],
      ["the fever", "das Fieber"],
      ["to cough", "husten"],
      ["the prescription", "das Rezept"],
      ["the pharmacy", "die Apotheke"],
      ["tired", "müde"],
    ],
    paragraphs: [
      "Leo ist seit zwei Tagen krank. Er hat Fieber, hustet viel und ist sehr müde.",
      "Am Nachmittag hat er einen Arzttermin. Der Arzt untersucht Leo und gibt ihm ein Rezept.",
      "Danach geht Leo zur Apotheke. Zu Hause trinkt er Tee und ruht sich aus.",
    ],
    questions: [
      { q: "How long has Leo been sick?", options: ["Two days", "One week", "One month", "Since yesterday evening only"], answer: 0 },
      { q: "What symptoms does he have?", options: ["Fever and cough", "Back pain only", "A broken arm", "A toothache"], answer: 0 },
      { q: "What does the doctor give him?", options: ["A prescription", "A train ticket", "A contract", "A receipt"], answer: 0 },
      { q: "Where does Leo go after the appointment?", options: ["To the pharmacy", "To the office", "To the cinema", "To the Bürgeramt"], answer: 0 },
    ],
  },
  {
    id: "b1-heizung",
    level: "B1",
    topic: "haushalt",
    title: "Die Heizung funktioniert nicht",
    intro: "Apartment life in Germany: polite, practical, slightly cold.",
    vocab: [
      ["the heating", "die Heizung"],
      ["the landlord", "der Vermieter"],
      ["to repair", "reparieren"],
      ["the appointment", "der Termin"],
      ["the rent", "die Miete"],
      ["the complaint", "die Beschwerde"],
    ],
    paragraphs: [
      "Am Montagmorgen merkt Samira, dass die Heizung nicht funktioniert. Draußen sind es nur drei Grad, und die Wohnung ist sehr kalt.",
      "Sie schreibt ihrem Vermieter eine höfliche Nachricht: \"Könnten Sie bitte jemanden schicken? Die Heizung ist seit gestern Abend aus.\"",
      "Der Vermieter antwortet schnell und vereinbart einen Termin mit einem Handwerker. Samira ist erleichtert, weil sie keine Beschwerde schreiben muss.",
      "Am nächsten Tag wird die Heizung repariert. Danach ist die Wohnung wieder warm.",
    ],
    questions: [
      { q: "What is the main problem?", options: ["The heating is not working", "The rent is too high", "The window is broken", "The landlord is moving out"], answer: 0 },
      { q: "How does Samira contact the landlord?", options: ["She writes a polite message", "She sends a complaint immediately", "She calls the police", "She ignores it"], answer: 0 },
      { q: "Who comes to fix the problem?", options: ["A repair worker", "A neighbor", "A doctor", "A colleague"], answer: 0 },
      { q: "How does Samira feel after the answer?", options: ["Relieved", "Embarrassed", "Angry", "Jealous"], answer: 0 },
      { q: "When is the heating repaired?", options: ["The next day", "In three weeks", "Immediately at midnight", "Never"], answer: 0 },
    ],
  },
  {
    id: "b1-zug",
    level: "B1",
    topic: "transport",
    title: "Verspätung am Bahnsteig",
    intro: "A train story, because Germany insists.",
    vocab: [
      ["the train station", "der Bahnhof"],
      ["the platform", "der Bahnsteig"],
      ["the delay", "die Verspätung"],
      ["to change trains", "umsteigen"],
      ["the connection", "die Verbindung"],
      ["the replacement bus", "der Ersatzbus"],
    ],
    paragraphs: [
      "Jonas steht am Bahnsteig und wartet auf den Zug nach Köln. Auf der Anzeige steht plötzlich: 25 Minuten Verspätung.",
      "Er schaut in der App nach einer anderen Verbindung. Wenn er in Düsseldorf umsteigt, kommt er vielleicht noch rechtzeitig an.",
      "Dann kommt eine Durchsage: Wegen einer Baustelle fährt ab dem nächsten Bahnhof ein Ersatzbus. Jonas atmet tief durch und schreibt seinem Kollegen eine Nachricht.",
      "\"Ich komme später, aber ich bin unterwegs.\" Sein Kollege antwortet: \"Alles gut. Komm sicher an.\"",
    ],
    questions: [
      { q: "How late is the train?", options: ["25 minutes", "5 minutes", "One hour", "It is cancelled"], answer: 0 },
      { q: "What does Jonas check?", options: ["Another connection", "A restaurant bill", "His rental contract", "A doctor appointment"], answer: 0 },
      { q: "Why is there a replacement bus?", options: ["Because of construction work", "Because of snow", "Because Jonas missed his ticket", "Because the platform is closed forever"], answer: 0 },
      { q: "Who does Jonas message?", options: ["His colleague", "His landlord", "His doctor", "His neighbor"], answer: 0 },
      { q: "What is the colleague's reaction?", options: ["Calm and understanding", "Very angry", "Confused", "Silent"], answer: 0 },
    ],
  },
  {
    id: "b2-besprechung",
    level: "B2",
    topic: "arbeit",
    title: "Die schwierige Besprechung",
    intro: "Workplace German: disagreement without setting the room on fire.",
    vocab: [
      ["the meeting", "die Besprechung"],
      ["to take responsibility", "Verantwortung übernehmen"],
      ["to clarify", "klären"],
      ["binding", "verbindlich"],
      ["the proposal", "der Vorschlag"],
      ["to implement", "umsetzen"],
    ],
    paragraphs: [
      "In der Besprechung merkt Aylin, dass zwei Kollegen unterschiedliche Erwartungen haben. Beide glauben, dass der andere die Verantwortung übernimmt.",
      "Aylin bleibt ruhig und schlägt vor, die Aufgaben verbindlich zu klären. Sie sagt: \"Lasst uns kurz festhalten, wer was bis Freitag umsetzt.\"",
      "Zuerst wirkt die Stimmung angespannt. Dann schreiben alle ihre Aufgaben in die Projektliste. Der Vorschlag hilft, weil niemand mehr raten muss.",
      "Nach der Besprechung bedankt sich ihr Chef. Aylin findet: Gute Kommunikation spart später viel Stress.",
    ],
    questions: [
      { q: "What is the core problem in the meeting?", options: ["Unclear responsibility", "A missing document", "A cancelled train", "A broken printer"], answer: 0 },
      { q: "What does Aylin suggest?", options: ["Clarifying tasks in a binding way", "Ending the project", "Writing a complaint", "Ignoring the conflict"], answer: 0 },
      { q: "Why does the proposal help?", options: ["Nobody has to guess responsibilities", "It makes the meeting longer", "It avoids all future meetings", "It changes the deadline to next year"], answer: 0 },
      { q: "How is the mood at first?", options: ["Tense", "Playful", "Bored but happy", "Completely relaxed"], answer: 0 },
      { q: "What is Aylin's conclusion?", options: ["Good communication saves stress", "Meetings are always useless", "The boss should decide everything", "Projects do not need lists"], answer: 0 },
    ],
  },
  {
    id: "b2-buergeramt",
    level: "B2",
    topic: "behörden",
    title: "Der fehlende Nachweis",
    intro: "A very German micro-drama: one missing document.",
    vocab: [
      ["the registration office", "das Bürgeramt"],
      ["the proof", "der Nachweis"],
      ["to submit later", "nachreichen"],
      ["complete", "vollständig"],
      ["the processing time", "die Bearbeitungszeit"],
      ["the confirmation", "die Bestätigung"],
    ],
    paragraphs: [
      "Ravi hat einen Termin im Bürgeramt. Er bringt seinen Ausweis, das Formular und eine Kopie seines Mietvertrags mit.",
      "Die Sachbearbeiterin prüft die Unterlagen und sagt freundlich: \"Es fehlt noch ein Nachweis. Sie können ihn aber online nachreichen.\"",
      "Ravi ist kurz frustriert, fragt aber nach der Bearbeitungszeit. Die Sachbearbeiterin erklärt, dass der Antrag erst vollständig ist, wenn der Nachweis angekommen ist.",
      "Zu Hause lädt Ravi das Dokument hoch. Am nächsten Morgen bekommt er eine Bestätigung per E-Mail.",
    ],
    questions: [
      { q: "Where does Ravi have an appointment?", options: ["At the Bürgeramt", "At the hospital", "At the train station", "At a restaurant"], answer: 0 },
      { q: "What is missing?", options: ["A proof/document", "His ID card", "His phone", "The application form"], answer: 0 },
      { q: "How can Ravi submit the missing item?", options: ["Online", "Only by post", "Only in person next year", "By calling a friend"], answer: 0 },
      { q: "When is the application complete?", options: ["When the proof has arrived", "When Ravi leaves the office", "When the email address is changed", "Before the appointment starts"], answer: 0 },
      { q: "What happens the next morning?", options: ["He receives an email confirmation", "He gets a fine", "The office loses everything", "He cancels the appointment"], answer: 0 },
    ],
  },
];

const legacyStoryQuestionTranslations = {
  "Where does Mira go?": {
    q_de: "Wohin geht Mira?",
    q_en: "Where does Mira go?",
    options_de: ["In den Supermarkt", "Zum Arzt", "Zur Arbeit", "Zum Bahnhof"],
    options_en: ["To the supermarket", "To the doctor", "To work", "To the station"],
  },
  "What does Mira need?": {
    q_de: "Was braucht Mira?",
    q_en: "What does Mira need?",
    options_de: ["Brot, Käse und Wasser", "Kaffee und eine Fahrkarte", "Ein Formular", "Ein neues Handy"],
    options_en: ["Bread, cheese, and water", "Coffee and a ticket", "A form", "A new phone"],
  },
  "What does Mira look for at the checkout?": {
    q_de: "Was sucht Mira an der Kasse?",
    q_en: "What does Mira look for at the checkout?",
    options_de: ["Ihr Geld", "Ihren Schlüssel", "Ihre Fahrkarte", "Ihr Handy"],
    options_en: ["Her money", "Her key", "Her ticket", "Her phone"],
  },
  "Where is the money?": {
    q_de: "Wo ist das Geld?",
    q_en: "Where is the money?",
    options_de: ["In ihrer Tasche", "Im Kühlschrank", "Zu Hause", "Im Bus"],
    options_en: ["In her bag", "In the fridge", "At home", "On the bus"],
  },
  "Who does Tom meet?": {
    q_de: "Wen trifft Tom?",
    q_en: "Who does Tom meet?",
    options_de: ["Seinen Freund", "Seinen Arzt", "Seinen Chef", "Seinen Vermieter"],
    options_en: ["His friend", "His doctor", "His boss", "His landlord"],
  },
  "What does Tom drink?": {
    q_de: "Was trinkt Tom?",
    q_en: "What does Tom drink?",
    options_de: ["Kaffee", "Milch", "Tee", "Saft"],
    options_en: ["Coffee", "Milk", "Tea", "Juice"],
  },
  "How is the cafe?": {
    q_de: "Wie ist das Café?",
    q_en: "How is the cafe?",
    options_de: ["Klein, aber gut", "Groß und laut", "Geschlossen", "Sehr teuer"],
    options_en: ["Small but good", "Big and loud", "Closed", "Very expensive"],
  },
  "When does the story happen?": {
    q_de: "Wann passiert die Geschichte?",
    q_en: "When does the story happen?",
    options_de: ["Am Abend", "Am Morgen", "In der Nacht", "Am Montagmorgen"],
    options_en: ["In the evening", "In the morning", "At night", "On Monday morning"],
  },
  "What problem does Nina have?": {
    q_de: "Welches Problem hat Nina?",
    q_en: "What problem does Nina have?",
    options_de: ["Sie findet ihren Schlüssel nicht", "Sie hat den Zug verpasst", "Sie hat ihre Geldbörse verloren", "Sie ist krank"],
    options_en: ["She cannot find her key", "She missed the train", "She lost her wallet", "She is sick"],
  },
  "Where does Nina search?": {
    q_de: "Wo sucht Nina?",
    q_en: "Where does Nina search?",
    options_de: ["In mehreren Zimmern", "Nur draußen", "Am Bahnhof", "Bei der Arbeit"],
    options_en: ["In several rooms", "Only outside", "At the station", "At work"],
  },
  "Who does Nina call?": {
    q_de: "Wen ruft Nina an?",
    q_en: "Who does Nina call?",
    options_de: ["Ihre Nachbarin", "Ihren Arzt", "Ihren Vermieter", "Ihren Kollegen"],
    options_en: ["Her neighbor", "Her doctor", "Her landlord", "Her colleague"],
  },
  "Where is the key?": {
    q_de: "Wo ist der Schlüssel?",
    q_en: "Where is the key?",
    options_de: ["Neben der Tür", "Im Supermarkt", "Im Bus", "Unter dem Bett"],
    options_en: ["Next to the door", "In the supermarket", "In the bus", "Under the bed"],
  },
  "How long has Leo been sick?": {
    q_de: "Wie lange ist Leo schon krank?",
    q_en: "How long has Leo been sick?",
    options_de: ["Zwei Tage", "Eine Woche", "Einen Monat", "Nur seit gestern Abend"],
    options_en: ["Two days", "One week", "One month", "Since yesterday evening only"],
  },
  "What symptoms does he have?": {
    q_de: "Welche Symptome hat er?",
    q_en: "What symptoms does he have?",
    options_de: ["Fieber und Husten", "Nur Rückenschmerzen", "Einen gebrochenen Arm", "Zahnschmerzen"],
    options_en: ["Fever and cough", "Back pain only", "A broken arm", "A toothache"],
  },
  "What does the doctor give him?": {
    q_de: "Was gibt ihm der Arzt?",
    q_en: "What does the doctor give him?",
    options_de: ["Ein Rezept", "Eine Fahrkarte", "Einen Vertrag", "Einen Kassenzettel"],
    options_en: ["A prescription", "A train ticket", "A contract", "A receipt"],
  },
  "Where does Leo go after the appointment?": {
    q_de: "Wohin geht Leo nach dem Termin?",
    q_en: "Where does Leo go after the appointment?",
    options_de: ["Zur Apotheke", "Ins Büro", "Ins Kino", "Zum Bürgeramt"],
    options_en: ["To the pharmacy", "To the office", "To the cinema", "To the Bürgeramt"],
  },
  "What is the main problem?": {
    q_de: "Was ist das Hauptproblem?",
    q_en: "What is the main problem?",
    options_de: ["Die Heizung funktioniert nicht", "Die Miete ist zu hoch", "Das Fenster ist kaputt", "Der Vermieter zieht aus"],
    options_en: ["The heating is not working", "The rent is too high", "The window is broken", "The landlord is moving out"],
  },
  "How does Samira contact the landlord?": {
    q_de: "Wie kontaktiert Samira den Vermieter?",
    q_en: "How does Samira contact the landlord?",
    options_de: ["Sie schreibt eine höfliche Nachricht", "Sie schickt sofort eine Beschwerde", "Sie ruft die Polizei", "Sie ignoriert es"],
    options_en: ["She writes a polite message", "She sends a complaint immediately", "She calls the police", "She ignores it"],
  },
  "Who comes to fix the problem?": {
    q_de: "Wer kommt, um das Problem zu reparieren?",
    q_en: "Who comes to fix the problem?",
    options_de: ["Ein Handwerker", "Eine Nachbarin", "Ein Arzt", "Ein Kollege"],
    options_en: ["A repair worker", "A neighbor", "A doctor", "A colleague"],
  },
  "How does Samira feel after the answer?": {
    q_de: "Wie fühlt sich Samira nach der Antwort?",
    q_en: "How does Samira feel after the answer?",
    options_de: ["Erleichtert", "Peinlich berührt", "Wütend", "Eifersüchtig"],
    options_en: ["Relieved", "Embarrassed", "Angry", "Jealous"],
  },
  "When is the heating repaired?": {
    q_de: "Wann wird die Heizung repariert?",
    q_en: "When is the heating repaired?",
    options_de: ["Am nächsten Tag", "In drei Wochen", "Sofort um Mitternacht", "Nie"],
    options_en: ["The next day", "In three weeks", "Immediately at midnight", "Never"],
  },
  "How late is the train?": {
    q_de: "Wie viel Verspätung hat der Zug?",
    q_en: "How late is the train?",
    options_de: ["25 Minuten", "5 Minuten", "Eine Stunde", "Er fällt aus"],
    options_en: ["25 minutes", "5 minutes", "One hour", "It is cancelled"],
  },
  "What does Jonas check?": {
    q_de: "Was prüft Jonas?",
    q_en: "What does Jonas check?",
    options_de: ["Eine andere Verbindung", "Eine Restaurantrechnung", "Seinen Mietvertrag", "Einen Arzttermin"],
    options_en: ["Another connection", "A restaurant bill", "His rental contract", "A doctor appointment"],
  },
  "Why is there a replacement bus?": {
    q_de: "Warum fährt ein Ersatzbus?",
    q_en: "Why is there a replacement bus?",
    options_de: ["Wegen einer Baustelle", "Wegen Schnee", "Weil Jonas seine Fahrkarte verpasst hat", "Weil der Bahnsteig für immer geschlossen ist"],
    options_en: ["Because of construction work", "Because of snow", "Because Jonas missed his ticket", "Because the platform is closed forever"],
  },
  "Who does Jonas message?": {
    q_de: "Wem schreibt Jonas?",
    q_en: "Who does Jonas message?",
    options_de: ["Seinem Kollegen", "Seinem Vermieter", "Seinem Arzt", "Seiner Nachbarin"],
    options_en: ["His colleague", "His landlord", "His doctor", "His neighbor"],
  },
  "What is the colleague's reaction?": {
    q_de: "Wie reagiert der Kollege?",
    q_en: "What is the colleague's reaction?",
    options_de: ["Ruhig und verständnisvoll", "Sehr wütend", "Verwirrt", "Gar nicht"],
    options_en: ["Calm and understanding", "Very angry", "Confused", "Silent"],
  },
  "What is the core problem in the meeting?": {
    q_de: "Was ist das zentrale Problem in der Besprechung?",
    q_en: "What is the core problem in the meeting?",
    options_de: ["Unklare Verantwortung", "Ein fehlendes Dokument", "Ein ausgefallener Zug", "Ein kaputter Drucker"],
    options_en: ["Unclear responsibility", "A missing document", "A cancelled train", "A broken printer"],
  },
  "What does Aylin suggest?": {
    q_de: "Was schlägt Aylin vor?",
    q_en: "What does Aylin suggest?",
    options_de: ["Die Aufgaben verbindlich zu klären", "Das Projekt zu beenden", "Eine Beschwerde zu schreiben", "Den Konflikt zu ignorieren"],
    options_en: ["Clarifying tasks in a binding way", "Ending the project", "Writing a complaint", "Ignoring the conflict"],
  },
  "Why does the proposal help?": {
    q_de: "Warum hilft der Vorschlag?",
    q_en: "Why does the proposal help?",
    options_de: ["Niemand muss die Verantwortlichkeiten erraten", "Er macht die Besprechung länger", "Er verhindert alle zukünftigen Besprechungen", "Er verschiebt die Frist auf nächstes Jahr"],
    options_en: ["Nobody has to guess responsibilities", "It makes the meeting longer", "It avoids all future meetings", "It changes the deadline to next year"],
  },
  "How is the mood at first?": {
    q_de: "Wie ist die Stimmung am Anfang?",
    q_en: "How is the mood at first?",
    options_de: ["Angespannt", "Spielerisch", "Gelangweilt, aber glücklich", "Völlig entspannt"],
    options_en: ["Tense", "Playful", "Bored but happy", "Completely relaxed"],
  },
  "What is Aylin's conclusion?": {
    q_de: "Was ist Aylins Fazit?",
    q_en: "What is Aylin's conclusion?",
    options_de: ["Gute Kommunikation spart Stress", "Besprechungen sind immer nutzlos", "Der Chef sollte alles entscheiden", "Projekte brauchen keine Listen"],
    options_en: ["Good communication saves stress", "Meetings are always useless", "The boss should decide everything", "Projects do not need lists"],
  },
  "Where does Ravi have an appointment?": {
    q_de: "Wo hat Ravi einen Termin?",
    q_en: "Where does Ravi have an appointment?",
    options_de: ["Im Bürgeramt", "Im Krankenhaus", "Am Bahnhof", "In einem Restaurant"],
    options_en: ["At the Bürgeramt", "At the hospital", "At the train station", "At a restaurant"],
  },
  "What is missing?": {
    q_de: "Was fehlt?",
    q_en: "What is missing?",
    options_de: ["Ein Nachweis", "Sein Ausweis", "Sein Handy", "Das Antragsformular"],
    options_en: ["A proof/document", "His ID card", "His phone", "The application form"],
  },
  "How can Ravi submit the missing item?": {
    q_de: "Wie kann Ravi den fehlenden Nachweis einreichen?",
    q_en: "How can Ravi submit the missing item?",
    options_de: ["Online", "Nur per Post", "Nur nächstes Jahr persönlich", "Durch einen Anruf bei einem Freund"],
    options_en: ["Online", "Only by post", "Only in person next year", "By calling a friend"],
  },
  "When is the application complete?": {
    q_de: "Wann ist der Antrag vollständig?",
    q_en: "When is the application complete?",
    options_de: ["Wenn der Nachweis angekommen ist", "Wenn Ravi das Amt verlässt", "Wenn die E-Mail-Adresse geändert wird", "Bevor der Termin beginnt"],
    options_en: ["When the proof has arrived", "When Ravi leaves the office", "When the email address is changed", "Before the appointment starts"],
  },
  "What happens the next morning?": {
    q_de: "Was passiert am nächsten Morgen?",
    q_en: "What happens the next morning?",
    options_de: ["Er bekommt eine Bestätigung per E-Mail", "Er bekommt ein Bußgeld", "Das Amt verliert alles", "Er sagt den Termin ab"],
    options_en: ["He receives an email confirmation", "He gets a fine", "The office loses everything", "He cancels the appointment"],
  },
};

storyBank.push(
  {
    id: "a1-bus-ticket",
    level: "A1",
    topic: "transport",
    title: "Der Bus kommt gleich",
    intro: "A simple public transport moment.",
    vocab: [
      ["the bus", "der Bus", "noun"],
      ["the ticket", "die Fahrkarte", "noun"],
      ["the stop", "die Haltestelle", "noun"],
      ["to wait", "warten", "verb"],
      ["late", "spät", "adjective"],
      ["to arrive", "ankommen", "verb"],
    ],
    paragraphs: [
      "Lena steht an der Haltestelle. Sie wartet auf den Bus.",
      "Sie hat eine Fahrkarte in der Tasche. Der Bus kommt fünf Minuten spät.",
      "Lena steigt ein und setzt sich ans Fenster. Sie kommt pünktlich in der Schule an.",
    ],
    questions: [
      { q_de: "Wo wartet Lena?", q_en: "Where does Lena wait?", options_de: ["An der Haltestelle", "Im Supermarkt", "In der Küche", "Beim Arzt"], options_en: ["At the stop", "In the supermarket", "In the kitchen", "At the doctor"], answer: 0 },
      { q_de: "Was hat Lena in der Tasche?", q_en: "What does Lena have in her bag?", options_de: ["Eine Fahrkarte", "Ein Brot", "Ein Rezept", "Einen Schlüssel"], options_en: ["A ticket", "Bread", "A prescription", "A key"], answer: 0 },
      { q_de: "Wie spät kommt der Bus?", q_en: "How late is the bus?", options_de: ["Fünf Minuten", "Eine Stunde", "Einen Tag", "Gar nicht"], options_en: ["Five minutes", "One hour", "One day", "Not at all"], answer: 0 },
      { q_de: "Wo sitzt Lena?", q_en: "Where does Lena sit?", options_de: ["Am Fenster", "Neben dem Fahrer", "Auf dem Boden", "Draußen"], options_en: ["By the window", "Next to the driver", "On the floor", "Outside"], answer: 0 },
    ],
  },
  {
    id: "a1-regen",
    level: "A1",
    topic: "alltag",
    title: "Regen am Morgen",
    intro: "Tiny weather story, very Germany-coded.",
    vocab: [
      ["the rain", "der Regen", "noun"],
      ["the umbrella", "der Regenschirm", "noun"],
      ["the jacket", "die Jacke", "noun"],
      ["wet", "nass", "adjective"],
      ["cold", "kalt", "adjective"],
      ["to take", "nehmen", "verb"],
    ],
    paragraphs: [
      "Am Morgen sieht Emil aus dem Fenster. Es regnet.",
      "Er nimmt seinen Regenschirm und zieht eine Jacke an. Draußen ist es kalt.",
      "Seine Schuhe werden nass, aber Emil lacht. Im Büro trinkt er warmen Tee.",
    ],
    questions: [
      { q_de: "Wie ist das Wetter?", q_en: "How is the weather?", options_de: ["Es regnet", "Es schneit", "Es ist sehr heiß", "Es ist sonnig"], options_en: ["It is raining", "It is snowing", "It is very hot", "It is sunny"], answer: 0 },
      { q_de: "Was nimmt Emil mit?", q_en: "What does Emil take with him?", options_de: ["Einen Regenschirm", "Einen Koffer", "Eine Rechnung", "Ein Fahrrad"], options_en: ["An umbrella", "A suitcase", "An invoice", "A bicycle"], answer: 0 },
      { q_de: "Was wird nass?", q_en: "What gets wet?", options_de: ["Seine Schuhe", "Sein Handy", "Sein Brot", "Sein Bett"], options_en: ["His shoes", "His phone", "His bread", "His bed"], answer: 0 },
      { q_de: "Was trinkt Emil im Büro?", q_en: "What does Emil drink at the office?", options_de: ["Warmen Tee", "Kaltes Wasser", "Kaffee mit Eis", "Milch"], options_en: ["Warm tea", "Cold water", "Iced coffee", "Milk"], answer: 0 },
    ],
  },
  {
    id: "a1-nachbar",
    level: "A1",
    topic: "alltag",
    title: "Eine nette Nachbarin",
    intro: "Simple neighbor vocabulary with a warm tone.",
    vocab: [
      ["the neighbor", "die Nachbarin", "noun"],
      ["the door", "die Tür", "noun"],
      ["to help", "helfen", "verb"],
      ["friendly", "freundlich", "adjective"],
      ["the bag", "die Tasche", "noun"],
      ["heavy", "schwer", "adjective"],
    ],
    paragraphs: [
      "Sofia kommt nach Hause. Ihre Tasche ist sehr schwer.",
      "Vor der Tür trifft sie ihre Nachbarin. Die Nachbarin ist freundlich und hilft Sofia.",
      "Zusammen tragen sie die Tasche in die Wohnung. Sofia sagt: \"Vielen Dank!\"",
    ],
    questions: [
      { q_de: "Was ist schwer?", q_en: "What is heavy?", options_de: ["Sofias Tasche", "Die Tür", "Die Wohnung", "Der Kaffee"], options_en: ["Sofia's bag", "The door", "The apartment", "The coffee"], answer: 0 },
      { q_de: "Wen trifft Sofia?", q_en: "Who does Sofia meet?", options_de: ["Ihre Nachbarin", "Ihren Chef", "Einen Arzt", "Einen Busfahrer"], options_en: ["Her neighbor", "Her boss", "A doctor", "A bus driver"], answer: 0 },
      { q_de: "Wie ist die Nachbarin?", q_en: "How is the neighbor?", options_de: ["Freundlich", "Laut", "Krank", "Spät"], options_en: ["Friendly", "Loud", "Sick", "Late"], answer: 0 },
      { q_de: "Wobei hilft die Nachbarin?", q_en: "What does the neighbor help with?", options_de: ["Beim Tragen der Tasche", "Beim Kochen", "Beim Lernen", "Beim Reparieren"], options_en: ["Carrying the bag", "Cooking", "Studying", "Repairing"], answer: 0 },
    ],
  },
  {
    id: "a1-fruehstueck",
    level: "A1",
    topic: "alltag",
    title: "Frühstück vor Deutschkurs",
    intro: "Morning routine before language class.",
    vocab: [
      ["the breakfast", "das Frühstück", "noun"],
      ["the course", "der Kurs", "noun"],
      ["the banana", "die Banane", "noun"],
      ["the bus", "der Bus", "noun"],
      ["early", "früh", "adjective"],
      ["to learn", "lernen", "verb"],
    ],
    paragraphs: [
      "Noah steht früh auf. Er hat heute Deutschkurs.",
      "Zum Frühstück isst er eine Banane und trinkt Kaffee.",
      "Dann nimmt er den Bus. Im Kurs lernt er neue Wörter.",
    ],
    questions: [
      { q_de: "Warum steht Noah früh auf?", q_en: "Why does Noah get up early?", options_de: ["Er hat Deutschkurs", "Er fliegt nach Berlin", "Er ist krank", "Er sucht eine Wohnung"], options_en: ["He has German class", "He flies to Berlin", "He is sick", "He is looking for an apartment"], answer: 0 },
      { q_de: "Was isst Noah?", q_en: "What does Noah eat?", options_de: ["Eine Banane", "Ein Ei", "Käse", "Reis"], options_en: ["A banana", "An egg", "Cheese", "Rice"], answer: 0 },
      { q_de: "Wie fährt Noah zum Kurs?", q_en: "How does Noah go to class?", options_de: ["Mit dem Bus", "Mit dem Taxi", "Mit dem Fahrrad", "Zu Fuß"], options_en: ["By bus", "By taxi", "By bicycle", "On foot"], answer: 0 },
      { q_de: "Was lernt Noah im Kurs?", q_en: "What does Noah learn in class?", options_de: ["Neue Wörter", "Kochen", "Autofahren", "Schwimmen"], options_en: ["New words", "Cooking", "Driving", "Swimming"], answer: 0 },
    ],
  },
  {
    id: "a1-handy",
    level: "A1",
    topic: "alltag",
    title: "Die Nachricht von Mama",
    intro: "Short phone story with family language.",
    vocab: [
      ["the phone", "das Handy", "noun"],
      ["the message", "die Nachricht", "noun"],
      ["the mother", "die Mutter", "noun"],
      ["to call", "anrufen", "verb"],
      ["soon", "bald", "adverb"],
      ["happy", "glücklich", "adjective"],
    ],
    paragraphs: [
      "Ava sitzt im Park. Ihr Handy macht ein Geräusch.",
      "Sie liest eine Nachricht von ihrer Mutter: \"Ruf mich bitte bald an.\"",
      "Ava ruft ihre Mutter an. Danach ist sie glücklich.",
    ],
    questions: [
      { q_de: "Wo sitzt Ava?", q_en: "Where is Ava sitting?", options_de: ["Im Park", "Im Zug", "Im Supermarkt", "Im Bad"], options_en: ["In the park", "On the train", "In the supermarket", "In the bathroom"], answer: 0 },
      { q_de: "Von wem ist die Nachricht?", q_en: "Who is the message from?", options_de: ["Von ihrer Mutter", "Von ihrem Chef", "Von ihrem Arzt", "Von ihrem Vermieter"], options_en: ["From her mother", "From her boss", "From her doctor", "From her landlord"], answer: 0 },
      { q_de: "Was soll Ava tun?", q_en: "What should Ava do?", options_de: ["Ihre Mutter anrufen", "Einkaufen gehen", "Eine Rechnung bezahlen", "Den Bus nehmen"], options_en: ["Call her mother", "Go shopping", "Pay an invoice", "Take the bus"], answer: 0 },
      { q_de: "Wie fühlt sich Ava danach?", q_en: "How does Ava feel afterward?", options_de: ["Glücklich", "Ärgerlich", "Müde", "Kalt"], options_en: ["Happy", "Annoyed", "Tired", "Cold"], answer: 0 },
    ],
  },
  {
    id: "a1-sport",
    level: "A1",
    topic: "freizeit",
    title: "Laufen im Park",
    intro: "Very simple fitness story.",
    vocab: [
      ["the park", "der Park", "noun"],
      ["to run", "laufen", "verb"],
      ["tired", "müde", "adjective"],
      ["the water", "das Wasser", "noun"],
      ["the bench", "die Bank", "noun"],
      ["slowly", "langsam", "adverb"],
    ],
    paragraphs: [
      "Ben läuft am Samstag im Park. Am Anfang läuft er schnell.",
      "Nach zehn Minuten ist er müde. Er setzt sich auf eine Bank.",
      "Ben trinkt Wasser und läuft dann langsam nach Hause.",
    ],
    questions: [
      { q_de: "Wann läuft Ben?", q_en: "When does Ben run?", options_de: ["Am Samstag", "Am Montagmorgen", "In der Nacht", "Am Mittwoch"], options_en: ["On Saturday", "On Monday morning", "At night", "On Wednesday"], answer: 0 },
      { q_de: "Wo läuft Ben?", q_en: "Where does Ben run?", options_de: ["Im Park", "Im Büro", "Im Café", "Im Supermarkt"], options_en: ["In the park", "In the office", "In the cafe", "In the supermarket"], answer: 0 },
      { q_de: "Was macht Ben nach zehn Minuten?", q_en: "What does Ben do after ten minutes?", options_de: ["Er setzt sich auf eine Bank", "Er kauft Käse", "Er ruft den Arzt an", "Er fährt Zug"], options_en: ["He sits on a bench", "He buys cheese", "He calls the doctor", "He takes the train"], answer: 0 },
      { q_de: "Was trinkt Ben?", q_en: "What does Ben drink?", options_de: ["Wasser", "Kaffee", "Milch", "Saft"], options_en: ["Water", "Coffee", "Milk", "Juice"], answer: 0 },
    ],
  },
  {
    id: "a2-paket",
    level: "A2",
    topic: "alltag",
    title: "Das Paket im Paketshop",
    intro: "Real-life package pickup vocabulary.",
    vocab: [
      ["the package", "das Paket", "noun"],
      ["the pickup note", "die Abholkarte", "noun"],
      ["the ID card", "der Ausweis", "noun"],
      ["to pick up", "abholen", "verb"],
      ["the opening hours", "die Öffnungszeiten", "noun"],
      ["nearby", "in der Nähe", "phrase"],
    ],
    paragraphs: [
      "Mina findet eine Abholkarte im Briefkasten. Ihr Paket liegt im Paketshop in der Nähe.",
      "Nach der Arbeit schaut sie die Öffnungszeiten an. Der Shop ist bis acht Uhr geöffnet.",
      "Mina nimmt ihren Ausweis mit und holt das Paket ab. Zu Hause öffnet sie es sofort.",
    ],
    questions: [
      { q_de: "Was findet Mina im Briefkasten?", q_en: "What does Mina find in the mailbox?", options_de: ["Eine Abholkarte", "Eine Rechnung", "Eine Fahrkarte", "Ein Rezept"], options_en: ["A pickup note", "An invoice", "A ticket", "A prescription"], answer: 0 },
      { q_de: "Wo liegt das Paket?", q_en: "Where is the package?", options_de: ["Im Paketshop", "Im Büro", "Im Zug", "Beim Arzt"], options_en: ["At the package shop", "At the office", "On the train", "At the doctor"], answer: 0 },
      { q_de: "Was nimmt Mina mit?", q_en: "What does Mina take with her?", options_de: ["Ihren Ausweis", "Einen Regenschirm", "Eine Banane", "Eine Kündigung"], options_en: ["Her ID card", "An umbrella", "A banana", "A resignation"], answer: 0 },
      { q_de: "Wann öffnet sie das Paket?", q_en: "When does she open the package?", options_de: ["Sofort zu Hause", "Erst nächste Woche", "Im Paketshop", "Im Bus"], options_en: ["Immediately at home", "Only next week", "At the package shop", "On the bus"], answer: 0 },
    ],
  },
  {
    id: "a2-waesche",
    level: "A2",
    topic: "haushalt",
    title: "Die Waschmaschine ist besetzt",
    intro: "Shared laundry room drama, gentle version.",
    vocab: [
      ["the washing machine", "die Waschmaschine", "noun"],
      ["the laundry room", "der Waschraum", "noun"],
      ["occupied", "besetzt", "adjective"],
      ["to wait", "warten", "verb"],
      ["the neighbor", "der Nachbar", "noun"],
      ["to apologize", "sich entschuldigen", "verb"],
    ],
    paragraphs: [
      "Am Sonntag will Karim seine Wäsche waschen. Im Waschraum ist die Waschmaschine besetzt.",
      "Auf der Maschine liegt ein Korb. Karim wartet zehn Minuten und trifft dann seinen Nachbarn.",
      "Der Nachbar entschuldigt sich und nimmt die Wäsche heraus. Karim kann endlich waschen.",
    ],
    questions: [
      { q_de: "Was will Karim machen?", q_en: "What does Karim want to do?", options_de: ["Wäsche waschen", "Einkaufen gehen", "Eine Bewerbung schreiben", "Zum Arzt gehen"], options_en: ["Do laundry", "Go shopping", "Write an application", "Go to the doctor"], answer: 0 },
      { q_de: "Was ist besetzt?", q_en: "What is occupied?", options_de: ["Die Waschmaschine", "Der Bus", "Die Küche", "Der Balkon"], options_en: ["The washing machine", "The bus", "The kitchen", "The balcony"], answer: 0 },
      { q_de: "Wen trifft Karim?", q_en: "Who does Karim meet?", options_de: ["Seinen Nachbarn", "Seinen Chef", "Seine Ärztin", "Eine Verkäuferin"], options_en: ["His neighbor", "His boss", "His doctor", "A saleswoman"], answer: 0 },
      { q_de: "Was macht der Nachbar?", q_en: "What does the neighbor do?", options_de: ["Er entschuldigt sich", "Er repariert das Fahrrad", "Er ruft die Polizei", "Er kauft Brot"], options_en: ["He apologizes", "He repairs the bicycle", "He calls the police", "He buys bread"], answer: 0 },
    ],
  },
  {
    id: "a2-fahrrad",
    level: "A2",
    topic: "transport",
    title: "Ein platter Reifen",
    intro: "Bike problem, repair shop, everyday useful.",
    vocab: [
      ["the tire", "der Reifen", "noun"],
      ["flat", "platt", "adjective"],
      ["the repair shop", "die Werkstatt", "noun"],
      ["to repair", "reparieren", "verb"],
      ["the receipt", "der Kassenzettel", "noun"],
      ["cheap", "günstig", "adjective"],
    ],
    paragraphs: [
      "Julia will mit dem Fahrrad zur Arbeit fahren. Aber ein Reifen ist platt.",
      "Sie schiebt das Fahrrad zur Werkstatt um die Ecke. Der Mitarbeiter kann den Reifen sofort reparieren.",
      "Die Reparatur ist günstig. Julia bekommt einen Kassenzettel und fährt weiter zur Arbeit.",
    ],
    questions: [
      { q_de: "Was ist kaputt?", q_en: "What is broken?", options_de: ["Ein Reifen", "Der Sattel", "Die Klingel", "Das Licht"], options_en: ["A tire", "The saddle", "The bell", "The light"], answer: 0 },
      { q_de: "Wohin bringt Julia das Fahrrad?", q_en: "Where does Julia bring the bicycle?", options_de: ["Zur Werkstatt", "Zum Bürgeramt", "Zur Apotheke", "Zum Café"], options_en: ["To the repair shop", "To the Bürgeramt", "To the pharmacy", "To the cafe"], answer: 0 },
      { q_de: "Wie ist die Reparatur?", q_en: "How is the repair?", options_de: ["Günstig", "Sehr teuer", "Unmöglich", "Zu spät"], options_en: ["Cheap", "Very expensive", "Impossible", "Too late"], answer: 0 },
      { q_de: "Was bekommt Julia?", q_en: "What does Julia receive?", options_de: ["Einen Kassenzettel", "Ein Rezept", "Eine Einladung", "Eine Monatskarte"], options_en: ["A receipt", "A prescription", "An invitation", "A monthly pass"], answer: 0 },
    ],
  },
  {
    id: "a2-bibliothek",
    level: "A2",
    topic: "freizeit",
    title: "Ein Buch ausleihen",
    intro: "Library story for quiet weekend vibes.",
    vocab: [
      ["the library", "die Bibliothek", "noun"],
      ["to borrow", "ausleihen", "verb"],
      ["the library card", "der Bibliotheksausweis", "noun"],
      ["quiet", "ruhig", "adjective"],
      ["to return", "zurückgeben", "verb"],
      ["the novel", "der Roman", "noun"],
    ],
    paragraphs: [
      "Am Samstag geht Omar in die Bibliothek. Dort ist es ruhig.",
      "Er möchte einen Roman ausleihen, aber er findet seinen Bibliotheksausweis nicht sofort.",
      "Eine Mitarbeiterin hilft ihm. Am Ende leiht Omar zwei Bücher aus und muss sie in vier Wochen zurückgeben.",
    ],
    questions: [
      { q_de: "Wo ist Omar am Samstag?", q_en: "Where is Omar on Saturday?", options_de: ["In der Bibliothek", "Im Fitnessstudio", "Im Rathaus", "Im Supermarkt"], options_en: ["In the library", "At the gym", "At city hall", "In the supermarket"], answer: 0 },
      { q_de: "Was möchte Omar ausleihen?", q_en: "What does Omar want to borrow?", options_de: ["Einen Roman", "Ein Fahrrad", "Eine Jacke", "Einen Schlüssel"], options_en: ["A novel", "A bicycle", "A jacket", "A key"], answer: 0 },
      { q_de: "Was findet Omar nicht sofort?", q_en: "What does Omar not find immediately?", options_de: ["Seinen Bibliotheksausweis", "Seinen Pass", "Seine Schuhe", "Seine Wohnung"], options_en: ["His library card", "His passport", "His shoes", "His apartment"], answer: 0 },
      { q_de: "Wann muss er die Bücher zurückgeben?", q_en: "When must he return the books?", options_de: ["In vier Wochen", "Morgen", "In einem Jahr", "Heute Abend"], options_en: ["In four weeks", "Tomorrow", "In one year", "Tonight"], answer: 0 },
    ],
  },
  {
    id: "a2-abendessen",
    level: "A2",
    topic: "freizeit",
    title: "Ein Abendessen bei Freunden",
    intro: "Invitations, bringing something, small talk.",
    vocab: [
      ["the invitation", "die Einladung", "noun"],
      ["to bring", "mitbringen", "verb"],
      ["the dessert", "der Nachtisch", "noun"],
      ["to taste good", "schmecken", "verb"],
      ["the kitchen", "die Küche", "noun"],
      ["the guest", "der Gast", "noun"],
    ],
    paragraphs: [
      "Elif bekommt eine Einladung zum Abendessen. Ihre Freunde wohnen in der Nähe.",
      "Sie fragt: \"Soll ich etwas mitbringen?\" Ihr Freund sagt: \"Vielleicht einen Nachtisch.\"",
      "Elif macht einen kleinen Kuchen. Beim Abendessen schmeckt allen der Nachtisch sehr gut.",
    ],
    questions: [
      { q_de: "Wozu bekommt Elif eine Einladung?", q_en: "What does Elif receive an invitation to?", options_de: ["Zum Abendessen", "Zu einem Arzttermin", "Zu einer Wohnungsbesichtigung", "Zu einer Besprechung"], options_en: ["To dinner", "To a doctor appointment", "To an apartment viewing", "To a meeting"], answer: 0 },
      { q_de: "Was soll Elif mitbringen?", q_en: "What should Elif bring?", options_de: ["Einen Nachtisch", "Eine Fahrkarte", "Ein Formular", "Einen Regenschirm"], options_en: ["A dessert", "A ticket", "A form", "An umbrella"], answer: 0 },
      { q_de: "Was macht Elif?", q_en: "What does Elif make?", options_de: ["Einen kleinen Kuchen", "Eine Suppe", "Einen Salat", "Ein Brot"], options_en: ["A small cake", "A soup", "A salad", "A bread"], answer: 0 },
      { q_de: "Wie finden die Gäste den Nachtisch?", q_en: "How do the guests find the dessert?", options_de: ["Er schmeckt sehr gut", "Er ist zu kalt", "Er ist vergessen", "Er ist kaputt"], options_en: ["It tastes very good", "It is too cold", "It is forgotten", "It is broken"], answer: 0 },
    ],
  },
  {
    id: "a2-fitnesskurs",
    level: "A2",
    topic: "gesundheit",
    title: "Der erste Fitnesskurs",
    intro: "Useful for hobbies and health routines.",
    vocab: [
      ["the gym", "das Fitnessstudio", "noun"],
      ["the course", "der Kurs", "noun"],
      ["to register", "sich anmelden", "verb"],
      ["the trainer", "der Trainer", "noun"],
      ["the towel", "das Handtuch", "noun"],
      ["exhausted", "erschöpft", "adjective"],
    ],
    paragraphs: [
      "Rosa meldet sich für einen Kurs im Fitnessstudio an. Der Kurs beginnt um siebzehn Uhr.",
      "Der Trainer ist freundlich und erklärt jede Übung langsam. Rosa hat ein Handtuch und Wasser dabei.",
      "Nach dem Kurs ist sie erschöpft, aber zufrieden. Sie möchte nächste Woche wiederkommen.",
    ],
    questions: [
      { q_de: "Wofür meldet sich Rosa an?", q_en: "What does Rosa register for?", options_de: ["Für einen Fitnesskurs", "Für einen Sprachtest", "Für eine Wohnung", "Für eine Versicherung"], options_en: ["For a fitness course", "For a language test", "For an apartment", "For insurance"], answer: 0 },
      { q_de: "Wann beginnt der Kurs?", q_en: "When does the course begin?", options_de: ["Um siebzehn Uhr", "Um acht Uhr", "Um Mitternacht", "Um sechs Uhr morgens"], options_en: ["At five p.m.", "At eight", "At midnight", "At six a.m."], answer: 0 },
      { q_de: "Was hat Rosa dabei?", q_en: "What does Rosa have with her?", options_de: ["Ein Handtuch und Wasser", "Einen Vertrag", "Eine Rechnung", "Einen Blumenstrauß"], options_en: ["A towel and water", "A contract", "An invoice", "A bouquet"], answer: 0 },
      { q_de: "Wie fühlt sich Rosa nach dem Kurs?", q_en: "How does Rosa feel after the class?", options_de: ["Erschöpft, aber zufrieden", "Krank und wütend", "Langweilig und kalt", "Nervös und traurig"], options_en: ["Exhausted but satisfied", "Sick and angry", "Bored and cold", "Nervous and sad"], answer: 0 },
    ],
  },
  {
    id: "b1-ueberweisung",
    level: "B1",
    topic: "alltag",
    title: "Die falsche Überweisung",
    intro: "Banking stress without the full panic.",
    vocab: [
      ["the invoice", "die Rechnung", "noun"],
      ["the bank transfer", "die Überweisung", "noun"],
      ["the account number", "die Kontonummer", "noun"],
      ["to check", "überprüfen", "verb"],
      ["the mistake", "der Fehler", "noun"],
      ["to correct", "korrigieren", "verb"],
    ],
    paragraphs: [
      "Nadia bekommt eine Rechnung für ihren Internetvertrag. Sie macht sofort eine Überweisung.",
      "Am Abend merkt sie, dass eine Zahl in der Kontonummer falsch ist. Sie überprüft alles noch einmal und wird nervös.",
      "Am nächsten Morgen ruft sie bei der Bank an. Die Mitarbeiterin kann die Überweisung stoppen.",
      "Nadia korrigiert den Fehler und speichert die richtige Kontonummer für das nächste Mal.",
    ],
    questions: [
      { q_de: "Wofür bekommt Nadia eine Rechnung?", q_en: "What does Nadia receive an invoice for?", options_de: ["Für ihren Internetvertrag", "Für eine Zugfahrt", "Für eine Reparatur", "Für den Deutschkurs"], options_en: ["For her internet contract", "For a train ride", "For a repair", "For the German course"], answer: 0 },
      { q_de: "Was ist falsch?", q_en: "What is wrong?", options_de: ["Eine Zahl in der Kontonummer", "Ihr Name", "Die Adresse der Bank", "Das Datum"], options_en: ["One digit in the account number", "Her name", "The bank's address", "The date"], answer: 0 },
      { q_de: "Was macht die Bankmitarbeiterin?", q_en: "What does the bank employee do?", options_de: ["Sie stoppt die Überweisung", "Sie erhöht die Rechnung", "Sie kündigt den Vertrag", "Sie schließt das Konto"], options_en: ["She stops the transfer", "She increases the invoice", "She cancels the contract", "She closes the account"], answer: 0 },
      { q_de: "Was speichert Nadia?", q_en: "What does Nadia save?", options_de: ["Die richtige Kontonummer", "Eine neue Fahrkarte", "Den Mietvertrag", "Eine Beschwerde"], options_en: ["The correct account number", "A new ticket", "The rental contract", "A complaint"], answer: 0 },
    ],
  },
  {
    id: "b1-lauter-nachbar",
    level: "B1",
    topic: "haushalt",
    title: "Musik nach zehn",
    intro: "Neighbor noise, polite German conflict.",
    vocab: [
      ["the house rules", "die Hausordnung", "noun"],
      ["quiet hours", "die Ruhezeit", "noun"],
      ["to disturb", "stören", "verb"],
      ["consideration", "die Rücksicht", "noun"],
      ["to ring the bell", "klingeln", "verb"],
      ["the volume", "die Lautstärke", "noun"],
    ],
    paragraphs: [
      "Um halb elf hört Alex laute Musik aus der Nachbarwohnung. Laut Hausordnung beginnt die Ruhezeit um zehn.",
      "Alex will keinen Streit. Er klingelt freundlich und sagt: \"Entschuldigung, die Musik ist ziemlich laut.\"",
      "Der Nachbar wirkt überrascht, aber er reduziert sofort die Lautstärke. Er hatte die Zeit vergessen.",
      "Am nächsten Tag bedankt sich Alex für die Rücksicht. Danach grüßen sich beide entspannter im Treppenhaus.",
    ],
    questions: [
      { q_de: "Wann hört Alex laute Musik?", q_en: "When does Alex hear loud music?", options_de: ["Um halb elf", "Um acht Uhr morgens", "Am Nachmittag", "Um zehn vor sieben"], options_en: ["At 10:30", "At eight in the morning", "In the afternoon", "At 6:50"], answer: 0 },
      { q_de: "Wann beginnt die Ruhezeit?", q_en: "When do quiet hours begin?", options_de: ["Um zehn", "Um Mitternacht", "Um sechs", "Um halb zwölf"], options_en: ["At ten", "At midnight", "At six", "At 11:30"], answer: 0 },
      { q_de: "Wie spricht Alex mit dem Nachbarn?", q_en: "How does Alex speak with the neighbor?", options_de: ["Freundlich", "Aggressiv", "Gar nicht", "Nur per Brief"], options_en: ["Politely", "Aggressively", "Not at all", "Only by letter"], answer: 0 },
      { q_de: "Was macht der Nachbar?", q_en: "What does the neighbor do?", options_de: ["Er reduziert die Lautstärke", "Er ruft die Polizei", "Er zieht aus", "Er macht die Musik lauter"], options_en: ["He lowers the volume", "He calls the police", "He moves out", "He makes the music louder"], answer: 0 },
    ],
  },
  {
    id: "b1-vorstellungsgespraech",
    level: "B1",
    topic: "arbeit",
    title: "Das Vorstellungsgespräch",
    intro: "Interview nerves with practical work words.",
    vocab: [
      ["the job interview", "das Vorstellungsgespräch", "noun"],
      ["the experience", "die Erfahrung", "noun"],
      ["the strength", "die Stärke", "noun"],
      ["reliable", "zuverlässig", "adjective"],
      ["to describe", "beschreiben", "verb"],
      ["the team", "das Team", "noun"],
    ],
    paragraphs: [
      "Mara hat ein Vorstellungsgespräch in einer kleinen Firma. Sie ist nervös, aber gut vorbereitet.",
      "Der Personaler fragt nach ihrer Erfahrung und ihren Stärken. Mara beschreibt ein Projekt aus ihrer alten Arbeit.",
      "Sie sagt, dass sie zuverlässig ist und gern im Team arbeitet. Am Ende fühlt sie sich viel sicherer.",
      "Zwei Tage später bekommt sie eine Einladung zu einem zweiten Gespräch.",
    ],
    questions: [
      { q_de: "Wo hat Mara ein Vorstellungsgespräch?", q_en: "Where does Mara have an interview?", options_de: ["In einer kleinen Firma", "Im Bürgeramt", "In einer Arztpraxis", "Im Bahnhof"], options_en: ["At a small company", "At the Bürgeramt", "At a doctor's office", "At the station"], answer: 0 },
      { q_de: "Wonach fragt der Personaler?", q_en: "What does the HR person ask about?", options_de: ["Nach Erfahrung und Stärken", "Nach ihrer Miete", "Nach ihrer Monatskarte", "Nach einem Rezept"], options_en: ["Experience and strengths", "Her rent", "Her monthly pass", "A prescription"], answer: 0 },
      { q_de: "Wie beschreibt sich Mara?", q_en: "How does Mara describe herself?", options_de: ["Zuverlässig und teamorientiert", "Müde und krank", "Unpünktlich und laut", "Unsicher und wütend"], options_en: ["Reliable and team-oriented", "Tired and sick", "Unpunctual and loud", "Unsure and angry"], answer: 0 },
      { q_de: "Was bekommt Mara später?", q_en: "What does Mara receive later?", options_de: ["Eine Einladung zu einem zweiten Gespräch", "Eine Kündigung", "Eine Rechnung", "Eine Beschwerde"], options_en: ["An invitation to a second interview", "A termination", "An invoice", "A complaint"], answer: 0 },
    ],
  },
  {
    id: "b1-muelltrennung",
    level: "B1",
    topic: "haushalt",
    title: "Der gelbe Sack",
    intro: "Waste separation, because yes, this is daily German life.",
    vocab: [
      ["waste separation", "die Mülltrennung", "noun"],
      ["the yellow bag", "der gelbe Sack", "noun"],
      ["the bottle deposit", "das Pfand", "noun"],
      ["the paper bin", "die Papiertonne", "noun"],
      ["to separate", "trennen", "verb"],
      ["the packaging", "die Verpackung", "noun"],
    ],
    paragraphs: [
      "Nach dem Umzug ist Pablo bei der Mülltrennung unsicher. In seiner Küche stehen drei verschiedene Behälter.",
      "Seine Nachbarin erklärt: Papier kommt in die Papiertonne, Verpackungen in den gelben Sack und Flaschen mit Pfand zurück in den Laden.",
      "Pablo schreibt sich eine kleine Liste an den Kühlschrank. Nach einer Woche ist es schon Routine.",
      "Er merkt: Mülltrennung klingt kompliziert, aber mit System geht es schnell.",
    ],
    questions: [
      { q_de: "Warum ist Pablo unsicher?", q_en: "Why is Pablo unsure?", options_de: ["Wegen der Mülltrennung", "Wegen seines Arbeitsvertrags", "Wegen einer Verspätung", "Wegen seines Rezepts"], options_en: ["Because of waste separation", "Because of his work contract", "Because of a delay", "Because of his prescription"], answer: 0 },
      { q_de: "Wohin kommt Papier?", q_en: "Where does paper go?", options_de: ["In die Papiertonne", "In den gelben Sack", "In den Supermarkt", "In die Waschmaschine"], options_en: ["Into the paper bin", "Into the yellow bag", "Into the supermarket", "Into the washing machine"], answer: 0 },
      { q_de: "Was macht Pablo mit der Liste?", q_en: "What does Pablo do with the list?", options_de: ["Er hängt sie an den Kühlschrank", "Er gibt sie beim Bürgeramt ab", "Er schickt sie seinem Chef", "Er wirft sie sofort weg"], options_en: ["He puts it on the fridge", "He submits it at the Bürgeramt", "He sends it to his boss", "He throws it away immediately"], answer: 0 },
      { q_de: "Wie findet Pablo die Mülltrennung nach einer Woche?", q_en: "How does Pablo find waste separation after one week?", options_de: ["Sie ist Routine", "Sie ist unmöglich", "Sie ist verboten", "Sie ist teuer"], options_en: ["It is routine", "It is impossible", "It is forbidden", "It is expensive"], answer: 0 },
    ],
  },
  {
    id: "b1-projektfrist",
    level: "B1",
    topic: "arbeit",
    title: "Freitag ist Fristtag",
    intro: "Team deadline without corporate stiffness.",
    vocab: [
      ["the deadline", "die Frist", "noun"],
      ["the task list", "die Aufgabenliste", "noun"],
      ["urgent", "dringend", "adjective"],
      ["to prioritize", "priorisieren", "verb"],
      ["to finish", "erledigen", "verb"],
      ["the update", "das Update", "noun"],
    ],
    paragraphs: [
      "Im Team von Leila ist die Frist am Freitag. Einige Aufgaben sind noch offen.",
      "Leila schaut in die Aufgabenliste und markiert, was dringend ist. Danach priorisiert sie drei Punkte.",
      "Am Nachmittag gibt sie ihrem Team ein kurzes Update. Alle wissen jetzt, was zuerst erledigt werden muss.",
      "Am Freitag schaffen sie die wichtigsten Aufgaben. Nicht perfekt, aber rechtzeitig.",
    ],
    questions: [
      { q_de: "Wann ist die Frist?", q_en: "When is the deadline?", options_de: ["Am Freitag", "Am Montag", "Heute Abend", "Nächsten Monat"], options_en: ["On Friday", "On Monday", "Tonight", "Next month"], answer: 0 },
      { q_de: "Was markiert Leila?", q_en: "What does Leila mark?", options_de: ["Dringende Aufgaben", "Neue Kollegen", "Alte Rechnungen", "Freie Wohnungen"], options_en: ["Urgent tasks", "New colleagues", "Old invoices", "Available apartments"], answer: 0 },
      { q_de: "Was gibt Leila dem Team?", q_en: "What does Leila give the team?", options_de: ["Ein kurzes Update", "Eine Beschwerde", "Eine Fahrkarte", "Ein Rezept"], options_en: ["A short update", "A complaint", "A ticket", "A prescription"], answer: 0 },
      { q_de: "Was schaffen sie bis Freitag?", q_en: "What do they manage by Friday?", options_de: ["Die wichtigsten Aufgaben", "Alle Aufgaben perfekt", "Gar nichts", "Nur die Pause"], options_en: ["The most important tasks", "All tasks perfectly", "Nothing", "Only the break"], answer: 0 },
    ],
  },
  {
    id: "b1-ueberweisung-arzt",
    level: "B1",
    topic: "gesundheit",
    title: "Die Überweisung zum Facharzt",
    intro: "Doctor referral vocabulary, useful in Germany.",
    vocab: [
      ["the referral", "die Überweisung", "noun", "gesundheit", "B1", "Medical referral, also bank transfer in another context."],
      ["the specialist", "der Facharzt", "noun"],
      ["the health insurance card", "die Gesundheitskarte", "noun"],
      ["the waiting time", "die Wartezeit", "noun"],
      ["to make an appointment", "einen Termin vereinbaren", "phrase"],
      ["the practice", "die Praxis", "noun"],
    ],
    paragraphs: [
      "Timo hat seit Wochen Rückenschmerzen. Sein Hausarzt gibt ihm eine Überweisung zum Facharzt.",
      "Zu Hause ruft Timo in einer Praxis an. Die Mitarbeiterin fragt nach seiner Gesundheitskarte und erklärt die Wartezeit.",
      "Der nächste freie Termin ist in drei Wochen. Timo nimmt den Termin, weil die Praxis gut erreichbar ist.",
      "Er legt die Überweisung in seinen Kalender, damit er sie nicht vergisst.",
    ],
    questions: [
      { q_de: "Warum braucht Timo einen Facharzt?", q_en: "Why does Timo need a specialist?", options_de: ["Wegen Rückenschmerzen", "Wegen Fieber", "Wegen eines Fahrradunfalls", "Wegen Zahnschmerzen"], options_en: ["Because of back pain", "Because of fever", "Because of a bicycle accident", "Because of toothache"], answer: 0 },
      { q_de: "Was gibt ihm der Hausarzt?", q_en: "What does the family doctor give him?", options_de: ["Eine Überweisung", "Eine Monatskarte", "Eine Rechnung", "Einen Mietvertrag"], options_en: ["A referral", "A monthly pass", "An invoice", "A rental contract"], answer: 0 },
      { q_de: "Wonach fragt die Mitarbeiterin?", q_en: "What does the employee ask about?", options_de: ["Nach der Gesundheitskarte", "Nach seiner Miete", "Nach seiner Kündigung", "Nach seinem Fahrrad"], options_en: ["The health insurance card", "His rent", "His termination", "His bicycle"], answer: 0 },
      { q_de: "Warum nimmt Timo den Termin?", q_en: "Why does Timo take the appointment?", options_de: ["Die Praxis ist gut erreichbar", "Der Termin ist morgen", "Die Wartezeit ist null", "Er will nicht zum Arzt"], options_en: ["The practice is easy to reach", "The appointment is tomorrow", "The waiting time is zero", "He does not want to go to the doctor"], answer: 0 },
    ],
  },
  {
    id: "b2-versicherung-schaden",
    level: "B2",
    topic: "alltag",
    title: "Der Wasserschaden",
    intro: "Insurance vocabulary through a realistic apartment problem.",
    vocab: [
      ["the water damage", "der Wasserschaden", "noun"],
      ["liability insurance", "die Haftpflichtversicherung", "noun"],
      ["the claim report", "die Schadensmeldung", "noun"],
      ["to document", "dokumentieren", "verb"],
      ["the evidence photo", "das Beweisfoto", "noun"],
      ["to reimburse", "erstatten", "verb"],
    ],
    paragraphs: [
      "Beim Blumengießen kippt Lea aus Versehen eine Vase um. Wasser läuft auf den Boden und in die Wohnung darunter.",
      "Der Nachbar meldet einen kleinen Wasserschaden an der Decke. Lea bleibt ruhig und ruft ihre Haftpflichtversicherung an.",
      "Die Versicherung bittet sie, den Schaden zu dokumentieren und Beweisfotos zu schicken. Lea füllt die Schadensmeldung online aus.",
      "Nach zwei Wochen bekommt sie die Nachricht, dass die Reparaturkosten erstattet werden.",
    ],
    questions: [
      { q_de: "Wie entsteht der Wasserschaden?", q_en: "How does the water damage happen?", options_de: ["Lea kippt eine Vase um", "Ein Rohr platzt", "Der Nachbar vergisst den Wasserhahn", "Die Heizung explodiert"], options_en: ["Lea knocks over a vase", "A pipe bursts", "The neighbor forgets the tap", "The heating explodes"], answer: 0 },
      { q_de: "Welche Versicherung ruft Lea an?", q_en: "Which insurance does Lea call?", options_de: ["Die Haftpflichtversicherung", "Die Krankenversicherung", "Die Rentenversicherung", "Die Reiseversicherung"], options_en: ["Liability insurance", "Health insurance", "Pension insurance", "Travel insurance"], answer: 0 },
      { q_de: "Was soll Lea schicken?", q_en: "What should Lea send?", options_de: ["Beweisfotos", "Eine Bewerbung", "Eine Fahrkarte", "Einen Arbeitsvertrag"], options_en: ["Evidence photos", "A job application", "A ticket", "A work contract"], answer: 0 },
      { q_de: "Was wird erstattet?", q_en: "What is reimbursed?", options_de: ["Die Reparaturkosten", "Die Miete für ein Jahr", "Leas Urlaub", "Der neue Teppich von Lea"], options_en: ["The repair costs", "Rent for a year", "Lea's vacation", "Lea's new carpet"], answer: 0 },
    ],
  },
  {
    id: "b2-mietvertrag-klausel",
    level: "B2",
    topic: "alltag",
    title: "Die Klausel im Mietvertrag",
    intro: "Reading contracts without losing your soul.",
    vocab: [
      ["the clause", "die Klausel", "noun"],
      ["the notice period", "die Kündigungsfrist", "noun"],
      ["to clarify", "klären", "verb"],
      ["binding", "verbindlich", "adjective"],
      ["the additional cost", "die Nebenkosten", "noun"],
      ["unclear", "unklar", "adjective"],
    ],
    paragraphs: [
      "Vor der Unterschrift liest Daniel seinen neuen Mietvertrag genau durch. Eine Klausel zu den Nebenkosten wirkt unklar.",
      "Er möchte nicht einfach unterschreiben und später überrascht werden. Deshalb schreibt er der Hausverwaltung eine kurze E-Mail.",
      "Er fragt, ob die Heizkosten schon in den Nebenkosten enthalten sind und welche Kündigungsfrist verbindlich gilt.",
      "Am nächsten Tag bekommt er eine klare Antwort. Erst danach unterschreibt er den Vertrag.",
    ],
    questions: [
      { q_de: "Warum schreibt Daniel der Hausverwaltung?", q_en: "Why does Daniel write to property management?", options_de: ["Eine Klausel ist unklar", "Er will sofort kündigen", "Er hat den Schlüssel verloren", "Die Heizung ist kaputt"], options_en: ["A clause is unclear", "He wants to terminate immediately", "He lost the key", "The heating is broken"], answer: 0 },
      { q_de: "Wozu fragt Daniel nach?", q_en: "What does Daniel ask about?", options_de: ["Nebenkosten und Kündigungsfrist", "Mülltrennung und Fahrräder", "Internet und Fernsehen", "Möbel und Pflanzen"], options_en: ["Additional costs and notice period", "Waste separation and bicycles", "Internet and television", "Furniture and plants"], answer: 0 },
      { q_de: "Wann unterschreibt Daniel?", q_en: "When does Daniel sign?", options_de: ["Nach der klaren Antwort", "Vor dem Lesen", "Während der Besichtigung", "Nie"], options_en: ["After the clear answer", "Before reading", "During the viewing", "Never"], answer: 0 },
      { q_de: "Was möchte Daniel vermeiden?", q_en: "What does Daniel want to avoid?", options_de: ["Spätere Überraschungen", "Eine Einladung", "Eine Gehaltserhöhung", "Einen Arzttermin"], options_en: ["Later surprises", "An invitation", "A salary increase", "A doctor appointment"], answer: 0 },
    ],
  },
  {
    id: "b2-feedback",
    level: "B2",
    topic: "arbeit",
    title: "Feedback ohne Drama",
    intro: "Workplace feedback with nuance.",
    vocab: [
      ["the feedback", "das Feedback", "noun"],
      ["the expectation", "die Erwartung", "noun"],
      ["to address", "ansprechen", "verb"],
      ["appreciative", "wertschätzend", "adjective"],
      ["specific", "konkret", "adjective"],
      ["to improve", "verbessern", "verb"],
    ],
    paragraphs: [
      "Im Monatsgespräch möchte Nils ein Problem ansprechen. Er findet, dass die Erwartungen im Projekt oft zu spät kommuniziert werden.",
      "Er beginnt wertschätzend und nennt ein konkretes Beispiel. Dadurch klingt sein Feedback nicht wie ein Angriff.",
      "Seine Teamleiterin hört zu und fragt, welche Lösung er vorschlägt. Nils schlägt ein kurzes Update jeden Mittwoch vor.",
      "Eine Woche später merkt das Team, dass die Zusammenarbeit klarer geworden ist.",
    ],
    questions: [
      { q_de: "Welches Problem spricht Nils an?", q_en: "Which problem does Nils address?", options_de: ["Zu spät kommunizierte Erwartungen", "Zu hohe Miete", "Zu laute Nachbarn", "Zu wenig Urlaub"], options_en: ["Expectations communicated too late", "Rent that is too high", "Neighbors that are too loud", "Too little vacation"], answer: 0 },
      { q_de: "Wie beginnt Nils das Gespräch?", q_en: "How does Nils begin the conversation?", options_de: ["Wertschätzend und konkret", "Laut und ungeduldig", "Ironisch und kalt", "Völlig schweigend"], options_en: ["Appreciatively and specifically", "Loudly and impatiently", "Ironically and coldly", "Completely silently"], answer: 0 },
      { q_de: "Was schlägt Nils vor?", q_en: "What does Nils suggest?", options_de: ["Ein kurzes Update jeden Mittwoch", "Eine längere Pause", "Einen neuen Chef", "Eine sofortige Kündigung"], options_en: ["A short update every Wednesday", "A longer break", "A new boss", "Immediate termination"], answer: 0 },
      { q_de: "Was verbessert sich?", q_en: "What improves?", options_de: ["Die Zusammenarbeit", "Die Miete", "Die Bahnverbindung", "Die Versicherung"], options_en: ["Collaboration", "Rent", "The train connection", "Insurance"], answer: 0 },
    ],
  },
  {
    id: "b2-frist-behoerde",
    level: "B2",
    topic: "behörden",
    title: "Eine Frist beim Amt",
    intro: "Authority vocabulary with deadline pressure.",
    vocab: [
      ["the deadline", "die Frist", "noun"],
      ["the application", "der Antrag", "noun"],
      ["to extend", "verlängern", "verb"],
      ["the reason", "die Begründung", "noun"],
      ["to process", "bearbeiten", "verb"],
      ["complete", "vollständig", "adjective"],
    ],
    paragraphs: [
      "Sana merkt am Abend, dass für ihren Antrag noch ein Dokument fehlt. Die Frist endet in zwei Tagen.",
      "Sie schreibt dem Amt sofort eine Nachricht und bittet um eine Verlängerung. In der Begründung erklärt sie, dass das Dokument erst nächste Woche ausgestellt wird.",
      "Am nächsten Morgen bekommt sie eine Antwort: Die Frist wird um zehn Tage verlängert, wenn sie den Antrag bis dahin vollständig einreicht.",
      "Sana ist erleichtert und legt sich eine Erinnerung in den Kalender.",
    ],
    questions: [
      { q_de: "Was fehlt Sana?", q_en: "What is Sana missing?", options_de: ["Ein Dokument", "Eine Fahrkarte", "Ein Rezept", "Ein Schlüssel"], options_en: ["A document", "A ticket", "A prescription", "A key"], answer: 0 },
      { q_de: "Wann endet die Frist?", q_en: "When does the deadline end?", options_de: ["In zwei Tagen", "In zwei Monaten", "Morgen früh um sechs", "Heute Mittag"], options_en: ["In two days", "In two months", "Tomorrow at six a.m.", "Today at noon"], answer: 0 },
      { q_de: "Worum bittet Sana?", q_en: "What does Sana ask for?", options_de: ["Um eine Verlängerung", "Um eine neue Wohnung", "Um eine Gehaltserhöhung", "Um einen Ersatzbus"], options_en: ["An extension", "A new apartment", "A salary increase", "A replacement bus"], answer: 0 },
      { q_de: "Was muss Sana vollständig einreichen?", q_en: "What must Sana submit completely?", options_de: ["Den Antrag", "Die Monatskarte", "Die Einladung", "Die Mülltrennung"], options_en: ["The application", "The monthly pass", "The invitation", "Waste separation"], answer: 0 },
    ],
  },
  {
    id: "b2-wg-konflikt",
    level: "B2",
    topic: "haushalt",
    title: "Der Putzplan in der WG",
    intro: "Flatshare conflict with compromise language.",
    vocab: [
      ["the flatshare", "die WG", "noun"],
      ["the cleaning schedule", "der Putzplan", "noun"],
      ["the compromise", "der Kompromiss", "noun"],
      ["to distribute", "verteilen", "verb"],
      ["fair", "fair", "adjective"],
      ["the agreement", "die Vereinbarung", "noun"],
    ],
    paragraphs: [
      "In der WG von Fadi gibt es Streit über den Putzplan. Zwei Personen fühlen sich unfair behandelt.",
      "Beim gemeinsamen Abendessen sprechen alle offen darüber. Fadi schlägt vor, die Aufgaben neu zu verteilen.",
      "Nach zwanzig Minuten finden sie einen Kompromiss: Die Aufgaben wechseln jede Woche, und schwere Aufgaben werden geteilt.",
      "Die neue Vereinbarung hängt jetzt am Kühlschrank. Die Stimmung ist deutlich entspannter.",
    ],
    questions: [
      { q_de: "Worum gibt es Streit?", q_en: "What is the conflict about?", options_de: ["Um den Putzplan", "Um die Miete", "Um einen Arzttermin", "Um eine Bewerbung"], options_en: ["The cleaning schedule", "Rent", "A doctor appointment", "A job application"], answer: 0 },
      { q_de: "Was schlägt Fadi vor?", q_en: "What does Fadi suggest?", options_de: ["Die Aufgaben neu zu verteilen", "Die WG zu verlassen", "Den Kühlschrank zu verkaufen", "Nicht mehr zu putzen"], options_en: ["Redistributing the tasks", "Leaving the flatshare", "Selling the fridge", "No longer cleaning"], answer: 0 },
      { q_de: "Wie sieht der Kompromiss aus?", q_en: "What does the compromise look like?", options_de: ["Aufgaben wechseln jede Woche", "Eine Person macht alles", "Niemand macht mehr etwas", "Alle zahlen eine Strafe"], options_en: ["Tasks change every week", "One person does everything", "Nobody does anything anymore", "Everyone pays a fine"], answer: 0 },
      { q_de: "Wo hängt die Vereinbarung?", q_en: "Where is the agreement posted?", options_de: ["Am Kühlschrank", "An der Haustür", "Im Bürgeramt", "Im Waschraum"], options_en: ["On the fridge", "On the front door", "At the Bürgeramt", "In the laundry room"], answer: 0 },
    ],
  },
  {
    id: "b2-weiterbildung",
    level: "B2",
    topic: "arbeit",
    title: "Die Weiterbildung",
    intro: "Career-growth vocabulary without startup fluff.",
    vocab: [
      ["the continuing education", "die Weiterbildung", "noun"],
      ["the funding", "die Förderung", "noun"],
      ["the requirement", "die Voraussetzung", "noun"],
      ["to apply for", "beantragen", "verb"],
      ["the certificate", "das Zertifikat", "noun"],
      ["to prove", "nachweisen", "verb"],
    ],
    paragraphs: [
      "Priya möchte eine Weiterbildung im Projektmanagement machen. Der Kurs ist teuer, aber ihre Firma bietet eine Förderung an.",
      "Im Intranet liest sie die Voraussetzungen: Sie muss erklären, warum der Kurs zu ihrer aktuellen Rolle passt.",
      "Priya beantragt die Förderung und fügt den Kursplan hinzu. Nach einer Woche bekommt sie die Zusage.",
      "Nach dem Kurs erhält sie ein Zertifikat. Im nächsten Mitarbeitergespräch kann sie ihre neuen Kenntnisse nachweisen.",
    ],
    questions: [
      { q_de: "Welche Weiterbildung möchte Priya machen?", q_en: "Which continuing education does Priya want to do?", options_de: ["Projektmanagement", "Erste Hilfe", "Fahrschule", "Deutsch A1"], options_en: ["Project management", "First aid", "Driving school", "German A1"], answer: 0 },
      { q_de: "Warum ist die Förderung wichtig?", q_en: "Why is the funding important?", options_de: ["Der Kurs ist teuer", "Der Kurs ist kostenlos", "Priya hat keine Zeit", "Die Firma verbietet Kurse"], options_en: ["The course is expensive", "The course is free", "Priya has no time", "The company forbids courses"], answer: 0 },
      { q_de: "Was muss Priya erklären?", q_en: "What must Priya explain?", options_de: ["Warum der Kurs zu ihrer Rolle passt", "Warum sie umzieht", "Warum sie krank ist", "Warum der Zug verspätet ist"], options_en: ["Why the course fits her role", "Why she is moving", "Why she is sick", "Why the train is delayed"], answer: 0 },
      { q_de: "Was erhält Priya nach dem Kurs?", q_en: "What does Priya receive after the course?", options_de: ["Ein Zertifikat", "Eine Kündigung", "Eine Nebenkostenabrechnung", "Eine Fahrkarte"], options_en: ["A certificate", "A termination", "A utility bill", "A ticket"], answer: 0 },
    ],
  }
);

const generatedStoryChoicePools = {
  places_de: ["im Supermarkt", "am Bahnhof", "in der Apotheke", "im Büro", "zu Hause", "im Bürgeramt", "im Café", "in der Werkstatt"],
  places_en: ["in the supermarket", "at the station", "in the pharmacy", "at the office", "at home", "at the Bürgeramt", "in the cafe", "at the repair shop"],
  problems_de: ["Ein Dokument fehlt", "Der Termin ist verschoben", "Die Verbindung ist langsam", "Die Rechnung ist falsch", "Die Tasche ist zu schwer", "Die Tür ist geschlossen", "Die Nachricht kommt zu spät", "Der Plan ist unklar"],
  problems_en: ["A document is missing", "The appointment is postponed", "The connection is slow", "The invoice is wrong", "The bag is too heavy", "The door is closed", "The message arrives too late", "The plan is unclear"],
  actions_de: ["Die Person fragt freundlich nach", "Die Person schreibt eine kurze Nachricht", "Die Person prüft die Unterlagen", "Die Person wartet ruhig", "Die Person ruft dort an", "Die Person bittet um Hilfe", "Die Person macht einen neuen Plan", "Die Person speichert die Information"],
  actions_en: ["The person asks politely", "The person writes a short message", "The person checks the documents", "The person waits calmly", "The person calls there", "The person asks for help", "The person makes a new plan", "The person saves the information"],
  endings_de: ["Alles klappt am Ende", "Die Situation ist danach klarer", "Niemand ist mehr gestresst", "Die Person fühlt sich erleichtert", "Der Termin funktioniert doch noch", "Das Problem wird gelöst", "Die Person lernt ein neues Wort", "Der Tag wird wieder ruhig"],
  endings_en: ["Everything works out in the end", "The situation is clearer afterward", "Nobody is stressed anymore", "The person feels relieved", "The appointment works out after all", "The problem is solved", "The person learns a new word", "The day becomes calm again"],
};

const extraStorySeeds = [
  ["a1-baeckerei", "A1", "alltag", "Früh beim Bäcker", "A simple bakery moment before work.", "Nora", "in der Bäckerei", "at the bakery", "Die Schlange ist länger als erwartet", "The line is longer than expected", "Sie wartet ruhig und bestellt zwei Brötchen", "She waits calmly and orders two rolls", "Sie bezahlt bar und geht zufrieden zur Arbeit", "She pays cash and goes to work satisfied", [["the bakery", "die Bäckerei", "noun"], ["the roll", "das Brötchen", "noun"], ["the line", "die Schlange", "noun"], ["to order", "bestellen", "verb"], ["to pay cash", "bar bezahlen", "phrase"]]],
  ["a1-apotheke-tee", "A1", "gesundheit", "Tee aus der Apotheke", "A tiny pharmacy story for sick days.", "Luca", "in der Apotheke", "in the pharmacy", "Er hat Husten und fühlt sich müde", "He has a cough and feels tired", "Er fragt nach Tee und bekommt eine Empfehlung", "He asks for tea and gets a recommendation", "Zu Hause trinkt er den Tee und ruht sich aus", "At home he drinks the tea and rests", [["the pharmacy", "die Apotheke", "noun"], ["the cough", "der Husten", "noun"], ["the tea", "der Tee", "noun"], ["tired", "müde", "adjective"], ["to rest", "sich ausruhen", "verb"]]],
  ["a1-bahnhof-gleis", "A1", "transport", "Das richtige Gleis", "Finding the right platform without panic.", "Mila", "am Bahnhof", "at the station", "Sie sieht ihr Gleis nicht sofort", "She does not see her platform immediately", "Sie schaut auf die Anzeige und fragt einen Mitarbeiter", "She checks the display and asks an employee", "Sie findet das Gleis und steigt pünktlich ein", "She finds the platform and boards on time", [["the platform", "das Gleis", "noun"], ["the display", "die Anzeige", "noun"], ["the employee", "der Mitarbeiter", "noun"], ["on time", "pünktlich", "adjective"], ["to board", "einsteigen", "verb"]]],
  ["a1-kueche-salz", "A1", "haushalt", "Kein Salz in der Küche", "Small cooking problem, easy vocab.", "Ben", "in der Küche", "in the kitchen", "Beim Kochen fehlt Salz", "Salt is missing while cooking", "Er fragt seine Nachbarin und bekommt ein bisschen Salz", "He asks his neighbor and gets a little salt", "Das Essen schmeckt gut", "The food tastes good", [["the kitchen", "die Küche", "noun"], ["the salt", "das Salz", "noun"], ["to cook", "kochen", "verb"], ["the neighbor", "die Nachbarin", "noun"], ["to taste good", "schmecken", "verb"]]],
  ["a1-markt-obst", "A1", "alltag", "Obst auf dem Markt", "Buying fruit with simple sentences.", "Sara", "auf dem Markt", "at the market", "Sie weiß nicht, welche Äpfel süß sind", "She does not know which apples are sweet", "Sie fragt den Verkäufer und probiert einen Apfel", "She asks the seller and tries an apple", "Sie kauft drei Äpfel und eine Banane", "She buys three apples and a banana", [["the market", "der Markt", "noun"], ["the apple", "der Apfel", "noun"], ["sweet", "süß", "adjective"], ["the seller", "der Verkäufer", "noun"], ["to try", "probieren", "verb"]]],
  ["a1-deutschkurs-heft", "A1", "alltag", "Das Heft im Deutschkurs", "Language class and a forgotten notebook.", "Omar", "im Deutschkurs", "in German class", "Er hat sein Heft zu Hause vergessen", "He forgot his notebook at home", "Er schreibt die neuen Wörter auf ein Blatt", "He writes the new words on a sheet of paper", "Am Abend klebt er das Blatt in sein Heft", "In the evening he sticks the sheet into his notebook", [["the notebook", "das Heft", "noun"], ["the sheet", "das Blatt", "noun"], ["to forget", "vergessen", "verb"], ["the word", "das Wort", "noun"], ["to write down", "aufschreiben", "verb"]]],
  ["a1-handy-akku", "A1", "alltag", "Der Akku ist leer", "Phone battery, charger, everyday stress.", "Eva", "im Café", "in the cafe", "Ihr Handy-Akku ist fast leer", "Her phone battery is almost empty", "Sie fragt freundlich nach einer Steckdose", "She politely asks for a power outlet", "Sie lädt das Handy und schreibt ihrer Freundin", "She charges the phone and messages her friend", [["the battery", "der Akku", "noun"], ["empty", "leer", "adjective"], ["the outlet", "die Steckdose", "noun"], ["to charge", "aufladen", "verb"], ["the friend", "die Freundin", "noun"]]],
  ["a1-regenschirm-bus", "A1", "transport", "Der Regenschirm im Bus", "Forgetting something on public transport.", "Tim", "im Bus", "on the bus", "Er lässt seinen Regenschirm auf dem Sitz liegen", "He leaves his umbrella on the seat", "Er merkt es an der Haltestelle und läuft zurück", "He notices it at the stop and runs back", "Der Busfahrer gibt ihm den Regenschirm", "The bus driver gives him the umbrella", [["the umbrella", "der Regenschirm", "noun"], ["the seat", "der Sitz", "noun"], ["the stop", "die Haltestelle", "noun"], ["to run back", "zurücklaufen", "verb"], ["the bus driver", "der Busfahrer", "noun"]]],
  ["a1-park-hund", "A1", "freizeit", "Ein Hund im Park", "Light park story with friendly small talk.", "Anna", "im Park", "in the park", "Ein kleiner Hund läuft zu ihr", "A small dog runs to her", "Sie fragt den Besitzer nach dem Namen", "She asks the owner for the name", "Anna streichelt den Hund und lächelt", "Anna pets the dog and smiles", [["the dog", "der Hund", "noun"], ["the owner", "der Besitzer", "noun"], ["small", "klein", "adjective"], ["to smile", "lächeln", "verb"], ["to pet", "streicheln", "verb"]]],
  ["a1-putzen-zimmer", "A1", "haushalt", "Das Zimmer aufräumen", "Simple home routine story.", "Jonas", "zu Hause", "at home", "Sein Zimmer ist sehr unordentlich", "His room is very messy", "Er räumt den Tisch auf und saugt den Boden", "He clears the table and vacuums the floor", "Danach findet er seinen Schlüssel wieder", "Afterward he finds his key again", [["the room", "das Zimmer", "noun"], ["messy", "unordentlich", "adjective"], ["the floor", "der Boden", "noun"], ["to vacuum", "staubsaugen", "verb"], ["the key", "der Schlüssel", "noun"]]],
  ["a1-fahrrad-licht", "A1", "transport", "Das Fahrradlicht", "Bike light before the evening ride.", "Lea", "vor dem Haus", "in front of the house", "Ihr Fahrradlicht geht nicht an", "Her bike light does not turn on", "Sie wechselt die Batterie und prüft das Licht", "She changes the battery and checks the light", "Dann fährt sie sicher zum Kurs", "Then she rides safely to class", [["the bicycle light", "das Fahrradlicht", "noun"], ["the battery", "die Batterie", "noun"], ["safe", "sicher", "adjective"], ["to check", "prüfen", "verb"], ["to ride", "fahren", "verb"]]],
  ["a1-cafe-zucker", "A1", "freizeit", "Zucker im Café", "Ordering coffee and asking simply.", "Paul", "im Café", "in the cafe", "Auf dem Tisch steht kein Zucker", "There is no sugar on the table", "Er fragt die Kellnerin nach Zucker", "He asks the waitress for sugar", "Sein Kaffee schmeckt danach besser", "His coffee tastes better afterward", [["the sugar", "der Zucker", "noun"], ["the table", "der Tisch", "noun"], ["the waitress", "die Kellnerin", "noun"], ["better", "besser", "adjective"], ["to ask for", "fragen nach", "phrase"]]],
  ["a1-arzt-karte", "A1", "gesundheit", "Die Karte beim Arzt", "Health card at reception.", "Ravi", "in der Arztpraxis", "at the doctor's office", "Er findet seine Gesundheitskarte nicht sofort", "He does not find his health card immediately", "Er sucht ruhig in seiner Tasche", "He searches calmly in his bag", "Die Karte liegt zwischen zwei Zetteln", "The card is between two notes", [["the doctor's office", "die Arztpraxis", "noun"], ["the health card", "die Gesundheitskarte", "noun"], ["the bag", "die Tasche", "noun"], ["the note", "der Zettel", "noun"], ["to search", "suchen", "verb"]]],
  ["a1-besuch-klingel", "A1", "alltag", "Besuch an der Tür", "A friend arrives, the doorbell rings.", "Sofia", "zu Hause", "at home", "Die Klingel ist sehr laut", "The doorbell is very loud", "Sie öffnet die Tür und begrüßt ihren Freund", "She opens the door and greets her friend", "Sie trinken Tee und sprechen über den Tag", "They drink tea and talk about the day", [["the doorbell", "die Klingel", "noun"], ["loud", "laut", "adjective"], ["to open", "öffnen", "verb"], ["to greet", "begrüßen", "verb"], ["the day", "der Tag", "noun"]]],
  ["a1-schule-brot", "A1", "alltag", "Das Brot für die Pause", "Small lunchbox story.", "Mika", "in der Schule", "at school", "Er hat sein Pausenbrot vergessen", "He forgot his snack bread", "Seine Freundin teilt einen Apfel mit ihm", "His friend shares an apple with him", "Mika bedankt sich und ist nicht mehr hungrig", "Mika says thanks and is no longer hungry", [["the break snack", "das Pausenbrot", "noun"], ["hungry", "hungrig", "adjective"], ["to share", "teilen", "verb"], ["to thank", "sich bedanken", "verb"], ["the apple", "der Apfel", "noun"]]],
  ["a1-einkaufstasche", "A1", "alltag", "Die Einkaufstasche", "Remembering a reusable bag.", "Ida", "im Supermarkt", "in the supermarket", "Sie hat keine Einkaufstasche dabei", "She has no shopping bag with her", "Sie kauft eine Papiertüte an der Kasse", "She buys a paper bag at the checkout", "Zu Hause legt sie eine Tasche neben die Tür", "At home she puts a bag next to the door", [["the shopping bag", "die Einkaufstasche", "noun"], ["the paper bag", "die Papiertüte", "noun"], ["the checkout", "die Kasse", "noun"], ["to have with you", "dabeihaben", "verb"], ["next to", "neben", "preposition"]]],
  ["a1-kino-platz", "A1", "freizeit", "Der Platz im Kino", "Cinema seat and simple numbers.", "Finn", "im Kino", "in the cinema", "Er findet seinen Platz nicht sofort", "He does not find his seat immediately", "Eine Mitarbeiterin zeigt ihm die Reihe", "An employee shows him the row", "Finn sitzt rechtzeitig vor dem Film", "Finn sits down on time before the movie", [["the cinema", "das Kino", "noun"], ["the seat", "der Platz", "noun"], ["the row", "die Reihe", "noun"], ["the film", "der Film", "noun"], ["on time", "rechtzeitig", "adverb"]]],
  ["a1-freund-geburtstag", "A1", "freizeit", "Geburtstag bei einem Freund", "A simple birthday visit.", "Clara", "bei einem Freund", "at a friend's place", "Sie weiß nicht, welches Geschenk passt", "She does not know which gift fits", "Sie kauft Blumen und eine kleine Karte", "She buys flowers and a small card", "Ihr Freund freut sich sehr", "Her friend is very happy", [["the birthday", "der Geburtstag", "noun"], ["the gift", "das Geschenk", "noun"], ["the flowers", "die Blumen", "noun"], ["the card", "die Karte", "noun"], ["to be happy", "sich freuen", "verb"]]],
  ["a2-friseur", "A2", "alltag", "Beim Friseur", "Haircut vocabulary for real appointments.", "Lena", "beim Friseur", "at the hairdresser", "Sie möchte nur die Spitzen schneiden lassen", "She only wants the ends trimmed", "Sie zeigt ein Foto und erklärt ihre Idee", "She shows a photo and explains her idea", "Der Schnitt ist kürzer, aber Lena ist zufrieden", "The cut is shorter, but Lena is satisfied", [["the hairdresser", "der Friseur", "noun"], ["the ends", "die Spitzen", "noun"], ["the cut", "der Schnitt", "noun"], ["to explain", "erklären", "verb"], ["satisfied", "zufrieden", "adjective"]]],
  ["a2-bankkarte", "A2", "alltag", "Die Bankkarte funktioniert nicht", "Card payment problem at a store.", "Nico", "an der Kasse", "at the checkout", "Seine Bankkarte funktioniert nicht", "His bank card does not work", "Er probiert es noch einmal und bezahlt dann bar", "He tries again and then pays cash", "Zu Hause prüft er sein Konto online", "At home he checks his account online", [["the bank card", "die Bankkarte", "noun"], ["the account", "das Konto", "noun"], ["to work", "funktionieren", "verb"], ["to try", "probieren", "verb"], ["cash", "bar", "adverb"]]],
  ["a2-wohnung-besichtigung", "A2", "alltag", "Die Wohnungsbesichtigung", "First apartment viewing story.", "Alina", "in einer kleinen Wohnung", "in a small apartment", "Sie möchte wissen, ob die Nebenkosten hoch sind", "She wants to know whether the additional costs are high", "Sie fragt die Maklerin nach Heizung und Strom", "She asks the agent about heating and electricity", "Alina schreibt sich alle Antworten ins Handy", "Alina writes all answers into her phone", [["the apartment viewing", "die Wohnungsbesichtigung", "noun"], ["additional costs", "die Nebenkosten", "noun"], ["the agent", "die Maklerin", "noun"], ["electricity", "der Strom", "noun"], ["to note down", "notieren", "verb"]]],
  ["a2-paket-nachbar", "A2", "alltag", "Das Paket beim Nachbarn", "Delivery went somewhere else.", "Elias", "im Treppenhaus", "in the stairwell", "Sein Paket liegt bei einer Nachbarin", "His package is with a neighbor", "Er klingelt freundlich und zeigt die Benachrichtigung", "He rings politely and shows the notification", "Die Nachbarin gibt ihm das Paket", "The neighbor gives him the package", [["the notification", "die Benachrichtigung", "noun"], ["the package", "das Paket", "noun"], ["the stairwell", "das Treppenhaus", "noun"], ["to ring the bell", "klingeln", "verb"], ["friendly", "freundlich", "adjective"]]],
  ["a2-bibliothek-ausweis", "A2", "freizeit", "Ein Ausweis für die Bibliothek", "Getting a library card.", "Maya", "in der Bibliothek", "in the library", "Sie möchte Bücher ausleihen, hat aber noch keinen Ausweis", "She wants to borrow books but does not have a card yet", "Sie füllt ein Formular aus und zeigt ihren Ausweis", "She fills out a form and shows her ID", "Nach zehn Minuten bekommt sie den Bibliotheksausweis", "After ten minutes she gets the library card", [["the library card", "der Bibliotheksausweis", "noun"], ["to borrow", "ausleihen", "verb"], ["the form", "das Formular", "noun"], ["the ID", "der Ausweis", "noun"], ["to fill out", "ausfüllen", "verb"]]],
  ["a2-sprachtest", "A2", "alltag", "Der kleine Sprachtest", "Nerves before a language test.", "Kenan", "im Sprachzentrum", "at the language center", "Er ist nervös vor dem mündlichen Teil", "He is nervous before the oral part", "Er atmet tief und wiederholt drei wichtige Sätze", "He breathes deeply and repeats three important sentences", "Im Gespräch versteht er mehr als erwartet", "In the conversation he understands more than expected", [["the language center", "das Sprachzentrum", "noun"], ["the oral part", "der mündliche Teil", "noun"], ["nervous", "nervös", "adjective"], ["to repeat", "wiederholen", "verb"], ["to understand", "verstehen", "verb"]]],
  ["a2-handyvertrag", "A2", "alltag", "Der neue Handyvertrag", "Phone contract basics.", "Rosa", "im Handygeschäft", "in the phone shop", "Sie versteht den Preis im Vertrag nicht ganz", "She does not fully understand the price in the contract", "Sie fragt nach Datenvolumen und Kündigungsfrist", "She asks about data volume and notice period", "Danach entscheidet sie sich für einen günstigeren Vertrag", "Afterward she chooses a cheaper contract", [["the phone contract", "der Handyvertrag", "noun"], ["data volume", "das Datenvolumen", "noun"], ["notice period", "die Kündigungsfrist", "noun"], ["cheaper", "günstiger", "adjective"], ["to decide", "sich entscheiden", "verb"]]],
  ["a2-schuh-reparatur", "A2", "alltag", "Der kaputte Schuh", "Small repair instead of buying new.", "Ali", "in der Schuhmacherei", "at the shoe repair shop", "Die Sohle seines Schuhs ist lose", "The sole of his shoe is loose", "Er fragt, ob eine Reparatur möglich ist", "He asks whether a repair is possible", "Am nächsten Tag holt er den Schuh repariert ab", "The next day he picks up the repaired shoe", [["the sole", "die Sohle", "noun"], ["loose", "lose", "adjective"], ["possible", "möglich", "adjective"], ["to pick up", "abholen", "verb"], ["the repair", "die Reparatur", "noun"]]],
  ["a2-kita-email", "A2", "alltag", "Eine E-Mail von der Kita", "Useful family admin vocabulary.", "Jana", "zu Hause", "at home", "Sie bekommt eine E-Mail von der Kita", "She receives an email from daycare", "Sie liest die Nachricht und füllt eine kleine Liste aus", "She reads the message and fills out a small list", "Am Morgen gibt sie die Liste bei der Erzieherin ab", "In the morning she gives the list to the educator", [["the daycare", "die Kita", "noun"], ["the educator", "die Erzieherin", "noun"], ["the list", "die Liste", "noun"], ["the email", "die E-Mail", "noun"], ["to hand in", "abgeben", "verb"]]],
  ["a2-reise-rucksack", "A2", "freizeit", "Der Rucksack für den Ausflug", "Packing for a day trip.", "Tobias", "zu Hause", "at home", "Er weiß nicht, was er für den Ausflug einpacken soll", "He does not know what to pack for the trip", "Er nimmt Wasser, eine Jacke und ein Ladegerät mit", "He takes water, a jacket, and a charger", "Beim Wandern ist er froh über die Jacke", "While hiking he is glad about the jacket", [["the backpack", "der Rucksack", "noun"], ["the trip", "der Ausflug", "noun"], ["the charger", "das Ladegerät", "noun"], ["to pack", "einpacken", "verb"], ["glad", "froh", "adjective"]]],
  ["a2-restaurant-reservierung", "A2", "freizeit", "Die Reservierung im Restaurant", "Dinner reservation mix-up.", "Pia", "im Restaurant", "in the restaurant", "Die Reservierung steht auf einen falschen Namen", "The reservation is under the wrong name", "Sie zeigt die Bestätigung auf dem Handy", "She shows the confirmation on her phone", "Der Kellner findet den Tisch nach kurzer Suche", "The waiter finds the table after a short search", [["the reservation", "die Reservierung", "noun"], ["the confirmation", "die Bestätigung", "noun"], ["the waiter", "der Kellner", "noun"], ["wrong", "falsch", "adjective"], ["to search", "suchen", "verb"]]],
  ["a2-volkshochschule", "A2", "alltag", "Kurs an der Volkshochschule", "Registering for an evening course.", "Hanna", "in der Volkshochschule", "at the adult education center", "Der Kurs ist fast ausgebucht", "The course is almost fully booked", "Sie meldet sich online schnell an", "She quickly registers online", "Am Abend bekommt sie eine automatische Bestätigung", "In the evening she receives an automatic confirmation", [["the adult education center", "die Volkshochschule", "noun"], ["fully booked", "ausgebucht", "adjective"], ["to register", "sich anmelden", "verb"], ["automatic", "automatisch", "adjective"], ["the course", "der Kurs", "noun"]]],
  ["a2-krankmeldung", "A2", "arbeit", "Krankmeldung am Morgen", "Calling in sick clearly.", "Moritz", "zu Hause", "at home", "Er hat Fieber und kann nicht arbeiten", "He has a fever and cannot work", "Er schreibt seiner Chefin eine kurze Krankmeldung", "He writes his boss a short sick note message", "Später ruft er in der Arztpraxis an", "Later he calls the doctor's office", [["the sick note message", "die Krankmeldung", "noun"], ["the boss", "die Chefin", "noun"], ["the fever", "das Fieber", "noun"], ["to call", "anrufen", "verb"], ["cannot", "kann nicht", "phrase"]]],
  ["a2-flohmarkt", "A2", "freizeit", "Ein Tisch auf dem Flohmarkt", "Buying something used.", "Lina", "auf dem Flohmarkt", "at the flea market", "Sie findet eine schöne Lampe ohne Preisschild", "She finds a nice lamp without a price tag", "Sie fragt nach dem Preis und handelt ein bisschen", "She asks for the price and negotiates a little", "Sie kauft die Lampe günstiger als erwartet", "She buys the lamp cheaper than expected", [["the flea market", "der Flohmarkt", "noun"], ["the lamp", "die Lampe", "noun"], ["the price tag", "das Preisschild", "noun"], ["to negotiate", "handeln", "verb"], ["cheaper", "günstiger", "adjective"]]],
  ["a2-termin-verschieben", "A2", "alltag", "Den Termin verschieben", "A common scheduling story.", "Viktor", "im Büro", "at the office", "Er schafft seinen Arzttermin um vier Uhr nicht", "He cannot make his doctor appointment at four", "Er ruft an und bittet um einen neuen Termin", "He calls and asks for a new appointment", "Die Praxis bietet ihm Freitagmorgen an", "The practice offers him Friday morning", [["the appointment", "der Termin", "noun"], ["to postpone", "verschieben", "verb"], ["to offer", "anbieten", "verb"], ["the doctor's office", "die Praxis", "noun"], ["Friday morning", "der Freitagmorgen", "noun"]]],
  ["a2-ruckgabe", "A2", "alltag", "Die Rückgabe im Laden", "Returning a wrong-size item.", "Nina", "im Laden", "in the store", "Der Pullover ist zu klein", "The sweater is too small", "Sie zeigt den Kassenzettel und fragt nach Rückgabe", "She shows the receipt and asks about returning it", "Die Verkäuferin tauscht den Pullover um", "The saleswoman exchanges the sweater", [["the return", "die Rückgabe", "noun"], ["the sweater", "der Pullover", "noun"], ["too small", "zu klein", "adjective"], ["the receipt", "der Kassenzettel", "noun"], ["to exchange", "umtauschen", "verb"]]],
  ["a2-praesentation-kurs", "A2", "alltag", "Eine kurze Präsentation", "Speaking practice in class.", "Sam", "im Deutschkurs", "in German class", "Er soll zwei Minuten über sein Hobby sprechen", "He should speak for two minutes about his hobby", "Er schreibt fünf Stichpunkte auf", "He writes down five bullet points", "Die Präsentation ist kurz, aber klar", "The presentation is short but clear", [["the presentation", "die Präsentation", "noun"], ["the hobby", "das Hobby", "noun"], ["bullet points", "die Stichpunkte", "noun"], ["clear", "klar", "adjective"], ["to speak", "sprechen", "verb"]]],
  ["b1-probezeit", "B1", "arbeit", "Ende der Probezeit", "Workplace relief after a nervous month.", "Mehmet", "im Büro", "at the office", "Seine Probezeit endet diese Woche", "His probation period ends this week", "Er spricht mit seiner Teamleiterin über Feedback", "He speaks with his team lead about feedback", "Er bekommt positives Feedback und fühlt sich sicherer", "He receives positive feedback and feels more secure", [["the probation period", "die Probezeit", "noun"], ["the team lead", "die Teamleiterin", "noun"], ["feedback", "das Feedback", "noun"], ["positive", "positiv", "adjective"], ["more secure", "sicherer", "adjective"]]],
  ["b1-nebenkosten", "B1", "alltag", "Die Nebenkostenabrechnung", "Apartment bill confusion made practical.", "Iris", "zu Hause", "at home", "Die Nebenkostenabrechnung ist höher als erwartet", "The utility bill is higher than expected", "Sie vergleicht die Zahlen mit dem letzten Jahr", "She compares the numbers with last year", "Danach schreibt sie der Hausverwaltung eine sachliche Frage", "Afterward she writes property management a factual question", [["utility bill", "die Nebenkostenabrechnung", "noun"], ["higher", "höher", "adjective"], ["to compare", "vergleichen", "verb"], ["factual", "sachlich", "adjective"], ["property management", "die Hausverwaltung", "noun"]]],
  ["b1-kundenservice", "B1", "alltag", "Anruf beim Kundenservice", "A support call without losing patience.", "Dario", "zu Hause", "at home", "Sein Internet ist seit dem Morgen langsam", "His internet has been slow since morning", "Er ruft beim Kundenservice an und beschreibt das Problem", "He calls customer service and describes the problem", "Die Mitarbeiterin öffnet ein Ticket für die Technik", "The employee opens a ticket for the technical team", [["customer service", "der Kundenservice", "noun"], ["slow", "langsam", "adjective"], ["to describe", "beschreiben", "verb"], ["the ticket", "das Ticket", "noun"], ["technical team", "die Technik", "noun"]]],
  ["b1-spaete-lieferung", "B1", "alltag", "Die verspätete Lieferung", "Delivery delay and polite follow-up.", "Greta", "im Homeoffice", "in the home office", "Die Lieferung für ihren Schreibtisch kommt nicht an", "The delivery for her desk does not arrive", "Sie schreibt dem Händler eine höfliche Nachfrage", "She writes the retailer a polite follow-up", "Der Händler nennt einen neuen Liefertermin", "The retailer gives a new delivery date", [["the delivery", "die Lieferung", "noun"], ["the desk", "der Schreibtisch", "noun"], ["the retailer", "der Händler", "noun"], ["follow-up question", "die Nachfrage", "noun"], ["delivery date", "der Liefertermin", "noun"]]],
  ["b1-sprachpartner", "B1", "freizeit", "Treffen mit dem Sprachpartner", "Practice conversation outside class.", "Noah", "im Park", "in the park", "Er möchte mehr Deutsch sprechen, ist aber unsicher", "He wants to speak more German but feels unsure", "Er trifft seinen Sprachpartner und erzählt vom Wochenende", "He meets his language partner and talks about the weekend", "Nach einer Stunde fühlt er sich mutiger", "After one hour he feels braver", [["language partner", "der Sprachpartner", "noun"], ["unsure", "unsicher", "adjective"], ["to tell", "erzählen", "verb"], ["the weekend", "das Wochenende", "noun"], ["braver", "mutiger", "adjective"]]],
  ["b1-verein", "B1", "freizeit", "Der erste Abend im Verein", "Joining a local club.", "Aylin", "im Sportverein", "at the sports club", "Sie kennt dort noch niemanden", "She does not know anyone there yet", "Sie stellt sich vor und fragt nach den Trainingszeiten", "She introduces herself and asks about training times", "Ein Mitglied lädt sie zur nächsten Gruppe ein", "A member invites her to the next group", [["the club", "der Verein", "noun"], ["training times", "die Trainingszeiten", "noun"], ["to introduce oneself", "sich vorstellen", "verb"], ["the member", "das Mitglied", "noun"], ["to invite", "einladen", "verb"]]],
  ["b1-fundbuero", "B1", "alltag", "Im Fundbüro", "Lost item office with practical questions.", "Sven", "im Fundbüro", "at the lost and found office", "Er hat seine Tasche in der Bahn vergessen", "He forgot his bag on the train", "Er beschreibt Farbe, Größe und Inhalt", "He describes color, size, and contents", "Zwei Tage später wird die Tasche gefunden", "Two days later the bag is found", [["lost and found office", "das Fundbüro", "noun"], ["the contents", "der Inhalt", "noun"], ["the color", "die Farbe", "noun"], ["the size", "die Größe", "noun"], ["to find", "finden", "verb"]]],
  ["b1-bewerbung-absenden", "B1", "arbeit", "Die Bewerbung abschicken", "Sending a job application carefully.", "Priya", "am Laptop", "at the laptop", "Sie möchte ihre Bewerbung abschicken, aber der Lebenslauf ist noch alt", "She wants to send her application, but the CV is still old", "Sie aktualisiert den Lebenslauf und prüft die Anhänge", "She updates the CV and checks the attachments", "Dann schickt sie die Bewerbung mit gutem Gefühl ab", "Then she sends the application with a good feeling", [["the application", "die Bewerbung", "noun"], ["the CV", "der Lebenslauf", "noun"], ["the attachment", "der Anhang", "noun"], ["to update", "aktualisieren", "verb"], ["to send", "abschicken", "verb"]]],
  ["b1-handwerkertermin", "B1", "haushalt", "Termin mit dem Handwerker", "Scheduling a repair visit.", "Mara", "in ihrer Wohnung", "in her apartment", "Der Wasserhahn tropft seit zwei Tagen", "The tap has been dripping for two days", "Sie vereinbart einen Termin mit einem Handwerker", "She schedules an appointment with a repair worker", "Der Handwerker repariert die Dichtung am Nachmittag", "The repair worker fixes the seal in the afternoon", [["the tap", "der Wasserhahn", "noun"], ["to drip", "tropfen", "verb"], ["repair worker", "der Handwerker", "noun"], ["the seal", "die Dichtung", "noun"], ["to schedule", "vereinbaren", "verb"]]],
  ["b1-team-mittag", "B1", "arbeit", "Mittagessen mit dem Team", "Social workplace language.", "Leo", "in der Kantine", "in the cafeteria", "Er ist neu im Team und kennt die Gespräche noch nicht", "He is new in the team and does not know the conversations yet", "Er stellt Fragen und hört aufmerksam zu", "He asks questions and listens attentively", "Nach dem Essen fühlt er sich mehr dazugehörig", "After lunch he feels more included", [["the cafeteria", "die Kantine", "noun"], ["new", "neu", "adjective"], ["attentive", "aufmerksam", "adjective"], ["to belong", "dazugehören", "verb"], ["to ask questions", "Fragen stellen", "phrase"]]],
  ["b1-zahnarzt", "B1", "gesundheit", "Beim Zahnarzt", "Dental appointment nerves.", "Kim", "in der Zahnarztpraxis", "at the dentist's office", "Sie hat seit dem Wochenende Zahnschmerzen", "She has had tooth pain since the weekend", "Sie beschreibt den Schmerz und fragt nach der Behandlung", "She describes the pain and asks about the treatment", "Die Zahnärztin erklärt jeden Schritt ruhig", "The dentist explains every step calmly", [["dentist's office", "die Zahnarztpraxis", "noun"], ["tooth pain", "die Zahnschmerzen", "noun"], ["the treatment", "die Behandlung", "noun"], ["the step", "der Schritt", "noun"], ["calmly", "ruhig", "adverb"]]],
  ["b1-umzugskarton", "B1", "alltag", "Kisten vor dem Umzug", "Moving apartments, very practical.", "Tara", "zwischen vielen Umzugskartons", "between many moving boxes", "Sie findet die Küchenutensilien nicht mehr", "She cannot find the kitchen utensils anymore", "Sie beschriftet die restlichen Kisten deutlicher", "She labels the remaining boxes more clearly", "Am Abend findet sie Teller und Tassen wieder", "In the evening she finds plates and cups again", [["moving box", "der Umzugskarton", "noun"], ["kitchen utensils", "die Küchenutensilien", "noun"], ["to label", "beschriften", "verb"], ["clearer", "deutlicher", "adjective"], ["the cup", "die Tasse", "noun"]]],
  ["b1-verspaetung-chef", "B1", "transport", "Nachricht wegen Verspätung", "Telling work you will be late.", "Jakob", "in der Bahn", "on the train", "Die Bahn bleibt wegen einer Störung stehen", "The train stops because of a disruption", "Er schreibt seinem Chef sofort eine kurze Nachricht", "He immediately writes his boss a short message", "Sein Chef antwortet verständnisvoll", "His boss replies understandingly", [["the disruption", "die Störung", "noun"], ["to stop", "stehen bleiben", "verb"], ["the boss", "der Chef", "noun"], ["understanding", "verständnisvoll", "adjective"], ["immediately", "sofort", "adverb"]]],
  ["b1-beschwerde-laden", "B1", "alltag", "Eine ruhige Beschwerde", "Complaint without sounding aggressive.", "Elif", "im Elektronikladen", "in the electronics store", "Der neue Kopfhörer funktioniert nach zwei Tagen nicht mehr", "The new headphones stop working after two days", "Sie erklärt das Problem ruhig und zeigt den Kassenzettel", "She explains the problem calmly and shows the receipt", "Der Mitarbeiter bietet einen Umtausch an", "The employee offers an exchange", [["the headphones", "der Kopfhörer", "noun"], ["electronics store", "der Elektronikladen", "noun"], ["the complaint", "die Beschwerde", "noun"], ["exchange", "der Umtausch", "noun"], ["to offer", "anbieten", "verb"]]],
  ["b1-arbeitszeit", "B1", "arbeit", "Flexible Arbeitszeit", "Clarifying working hours.", "Oskar", "im Büro", "at the office", "Er muss einmal pro Woche früher gehen", "He has to leave earlier once a week", "Er spricht mit seiner Vorgesetzten über flexible Arbeitszeit", "He speaks with his supervisor about flexible working hours", "Sie finden eine Lösung für Mittwoch", "They find a solution for Wednesday", [["working hours", "die Arbeitszeit", "noun"], ["flexible", "flexibel", "adjective"], ["the supervisor", "die Vorgesetzte", "noun"], ["the solution", "die Lösung", "noun"], ["earlier", "früher", "adverb"]]],
  ["b1-pruefung-anmeldung", "B1", "alltag", "Anmeldung zur Prüfung", "Exam registration admin.", "Rami", "am Computer", "at the computer", "Die Anmeldefrist endet heute Abend", "The registration deadline ends tonight", "Er lädt sein Dokument hoch und prüft die Daten", "He uploads his document and checks the data", "Kurz vor acht bekommt er die Bestätigung", "Shortly before eight he receives the confirmation", [["registration deadline", "die Anmeldefrist", "noun"], ["to upload", "hochladen", "verb"], ["the data", "die Daten", "noun"], ["the confirmation", "die Bestätigung", "noun"], ["shortly before", "kurz vor", "phrase"]]],
  ["b1-rezept-apotheke", "B1", "gesundheit", "Das digitale Rezept", "E-prescription at the pharmacy.", "Clara", "in der Apotheke", "in the pharmacy", "Das digitale Rezept wird zuerst nicht gefunden", "The digital prescription is not found at first", "Sie zeigt ihre Gesundheitskarte und wartet kurz", "She shows her health card and waits briefly", "Dann erscheint das Rezept im System", "Then the prescription appears in the system", [["digital prescription", "das digitale Rezept", "noun"], ["health card", "die Gesundheitskarte", "noun"], ["the system", "das System", "noun"], ["to appear", "erscheinen", "verb"], ["briefly", "kurz", "adverb"]]],
  ["b2-datenschutz", "B2", "arbeit", "Datenschutz im Newsletter", "Useful office language around privacy.", "Felix", "im Marketingteam", "in the marketing team", "Eine Kollegin möchte Kundendaten für einen Newsletter nutzen", "A colleague wants to use customer data for a newsletter", "Felix fragt nach der Einwilligung und der Datenschutzerklärung", "Felix asks about consent and the privacy policy", "Das Team prüft den Prozess, bevor die E-Mail versendet wird", "The team checks the process before the email is sent", [["data protection", "der Datenschutz", "noun"], ["consent", "die Einwilligung", "noun"], ["privacy policy", "die Datenschutzerklärung", "noun"], ["customer data", "die Kundendaten", "noun"], ["to send", "versenden", "verb"]]],
  ["b2-gehaltsgespraech", "B2", "arbeit", "Das Gehaltsgespräch", "Negotiating without sounding pushy.", "Mina", "im Jahresgespräch", "in the annual review", "Sie möchte eine Gehaltserhöhung ansprechen", "She wants to bring up a salary raise", "Sie nennt konkrete Ergebnisse und bleibt sachlich", "She names concrete results and stays factual", "Ihr Chef schlägt einen Folgetermin mit HR vor", "Her boss suggests a follow-up appointment with HR", [["salary raise", "die Gehaltserhöhung", "noun"], ["annual review", "das Jahresgespräch", "noun"], ["concrete", "konkret", "adjective"], ["factual", "sachlich", "adjective"], ["follow-up appointment", "der Folgetermin", "noun"]]],
  ["b2-aufenthaltstitel", "B2", "behörden", "Termin für den Aufenthaltstitel", "Residence permit paperwork.", "Arun", "in der Ausländerbehörde", "at the immigration office", "Ein Nachweis über die Krankenversicherung fehlt", "Proof of health insurance is missing", "Er fragt, ob er den Nachweis online nachreichen kann", "He asks whether he can submit the proof online later", "Die Sachbearbeiterin gibt ihm eine Frist von zwei Wochen", "The case worker gives him a deadline of two weeks", [["residence permit", "der Aufenthaltstitel", "noun"], ["immigration office", "die Ausländerbehörde", "noun"], ["proof", "der Nachweis", "noun"], ["to submit later", "nachreichen", "verb"], ["case worker", "die Sachbearbeiterin", "noun"]]],
  ["b2-rechnung-freelance", "B2", "arbeit", "Die erste Rechnung als Freelancer", "Freelance invoice vocabulary.", "Nele", "am Schreibtisch", "at the desk", "Sie ist unsicher, welche Pflichtangaben auf die Rechnung gehören", "She is unsure which required details belong on the invoice", "Sie prüft Steuernummer, Leistungszeitraum und Zahlungsziel", "She checks tax number, service period, and payment deadline", "Danach sendet sie die Rechnung professionell an den Kunden", "Afterward she sends the invoice professionally to the client", [["freelancer", "der Freelancer", "noun"], ["required details", "die Pflichtangaben", "noun"], ["tax number", "die Steuernummer", "noun"], ["payment deadline", "das Zahlungsziel", "noun"], ["the client", "der Kunde", "noun"]]],
  ["b2-kundin-eskalation", "B2", "arbeit", "Die unzufriedene Kundin", "De-escalating a customer issue.", "Jonas", "im Kundenservice", "in customer service", "Eine Kundin ist wegen einer Verzögerung verärgert", "A customer is upset because of a delay", "Jonas hört aktiv zu und fasst das Problem zusammen", "Jonas listens actively and summarizes the problem", "Die Kundin fühlt sich ernst genommen und akzeptiert die Lösung", "The customer feels taken seriously and accepts the solution", [["the delay", "die Verzögerung", "noun"], ["upset", "verärgert", "adjective"], ["to summarize", "zusammenfassen", "verb"], ["the solution", "die Lösung", "noun"], ["to accept", "akzeptieren", "verb"]]],
  ["b2-steuer-id", "B2", "behörden", "Die Steuer-ID fehlt", "Payroll admin in a new job.", "Sami", "in der Personalabteilung", "in HR", "Für die Gehaltsabrechnung fehlt seine Steuer-ID", "His tax ID is missing for payroll", "Er sucht den Brief vom Bundeszentralamt und scannt ihn ein", "He searches for the letter from the federal tax office and scans it", "Die Personalabteilung kann die Abrechnung rechtzeitig vorbereiten", "HR can prepare payroll on time", [["tax ID", "die Steuer-ID", "noun"], ["payroll", "die Gehaltsabrechnung", "noun"], ["HR department", "die Personalabteilung", "noun"], ["to scan", "einscannen", "verb"], ["on time", "rechtzeitig", "adverb"]]],
  ["b2-betreuung-platz", "B2", "behörden", "Warteliste für die Betreuung", "Childcare waiting list admin.", "Julia", "im Familienbüro", "at the family office", "Der gewünschte Betreuungsplatz ist noch nicht frei", "The desired childcare spot is not available yet", "Sie lässt sich auf die Warteliste setzen und fragt nach Alternativen", "She gets put on the waiting list and asks about alternatives", "Eine Mitarbeiterin nennt zwei andere Einrichtungen", "An employee names two other facilities", [["childcare spot", "der Betreuungsplatz", "noun"], ["waiting list", "die Warteliste", "noun"], ["alternative", "die Alternative", "noun"], ["facility", "die Einrichtung", "noun"], ["desired", "gewünscht", "adjective"]]],
  ["b2-bahn-entschaedigung", "B2", "transport", "Entschädigung nach Zugausfall", "Passenger rights after cancellation.", "Lukas", "zu Hause", "at home", "Sein Zug ist ausgefallen und er kam zwei Stunden später an", "His train was cancelled and he arrived two hours late", "Er füllt das Formular für Fahrgastrechte online aus", "He fills out the passenger rights form online", "Nach einigen Tagen bekommt er eine Entschädigung", "After a few days he receives compensation", [["compensation", "die Entschädigung", "noun"], ["train cancellation", "der Zugausfall", "noun"], ["passenger rights", "die Fahrgastrechte", "noun"], ["the form", "das Formular", "noun"], ["to arrive", "ankommen", "verb"]]],
  ["b2-krankschreibung-arbeit", "B2", "gesundheit", "Krankschreibung und Arbeitgeber", "Handling sick leave correctly.", "Tessa", "zu Hause", "at home", "Sie ist länger krank als erwartet", "She is sick longer than expected", "Sie informiert den Arbeitgeber und prüft die elektronische Krankschreibung", "She informs the employer and checks the electronic sick note", "Die Personalabteilung bestätigt den Eingang", "HR confirms receipt", [["sick leave note", "die Krankschreibung", "noun"], ["employer", "der Arbeitgeber", "noun"], ["electronic", "elektronisch", "adjective"], ["receipt", "der Eingang", "noun"], ["to confirm", "bestätigen", "verb"]]],
  ["b2-bewerbung-absage", "B2", "arbeit", "Eine Absage nach der Bewerbung", "Handling rejection professionally.", "David", "am Laptop", "at the laptop", "Er bekommt eine Absage auf eine Bewerbung", "He receives a rejection for an application", "Er antwortet höflich und bittet um kurzes Feedback", "He replies politely and asks for brief feedback", "Die Recruiterin schickt zwei hilfreiche Hinweise", "The recruiter sends two helpful notes", [["the rejection", "die Absage", "noun"], ["the application", "die Bewerbung", "noun"], ["the recruiter", "die Recruiterin", "noun"], ["the note", "der Hinweis", "noun"], ["helpful", "hilfreich", "adjective"]]],
  ["b2-mediation-wg", "B2", "haushalt", "Ein Gespräch in der WG", "Flatshare tension handled maturely.", "Fadi", "in der WG-Küche", "in the shared flat kitchen", "Zwei Mitbewohner streiten über Sauberkeit", "Two flatmates argue about cleanliness", "Fadi moderiert das Gespräch und sammelt konkrete Wünsche", "Fadi moderates the conversation and collects concrete wishes", "Sie einigen sich auf eine neue Vereinbarung", "They agree on a new agreement", [["flatmate", "der Mitbewohner", "noun"], ["cleanliness", "die Sauberkeit", "noun"], ["to moderate", "moderieren", "verb"], ["concrete", "konkret", "adjective"], ["agreement", "die Vereinbarung", "noun"]]],
  ["b2-netzwerktreffen", "B2", "arbeit", "Ein berufliches Netzwerktreffen", "Small talk and professional follow-up.", "Amira", "bei einem Netzwerktreffen", "at a networking event", "Sie kennt dort niemanden und fühlt sich zuerst unsicher", "She knows nobody there and feels unsure at first", "Sie stellt eine offene Frage und hört aufmerksam zu", "She asks an open question and listens attentively", "Am nächsten Tag schreibt sie zwei Kontakten eine Nachricht", "The next day she messages two contacts", [["networking event", "das Netzwerktreffen", "noun"], ["contact", "der Kontakt", "noun"], ["open question", "die offene Frage", "noun"], ["attentive", "aufmerksam", "adjective"], ["to message", "anschreiben", "verb"]]],
  ["b2-vertragsverhandlung", "B2", "arbeit", "Eine Vertragsverhandlung", "Careful negotiation language.", "Mara", "in einer Videokonferenz", "in a video conference", "Ein Punkt im Angebot ist finanziell unklar", "One point in the offer is financially unclear", "Sie fragt nach einer transparenten Aufschlüsselung der Kosten", "She asks for a transparent breakdown of costs", "Beide Seiten einigen sich auf eine angepasste Version", "Both sides agree on an adjusted version", [["contract negotiation", "die Vertragsverhandlung", "noun"], ["the offer", "das Angebot", "noun"], ["breakdown", "die Aufschlüsselung", "noun"], ["transparent", "transparent", "adjective"], ["adjusted", "angepasst", "adjective"]]],
  ["b2-elternabend", "B2", "alltag", "Elternabend in der Schule", "Parent meeting with formal-ish language.", "Robert", "beim Elternabend", "at the parent evening", "Viele Informationen kommen sehr schnell", "A lot of information comes very quickly", "Er macht Notizen und fragt nach den wichtigsten Fristen", "He takes notes and asks about the most important deadlines", "Nach dem Abend kennt er die nächsten Schritte", "After the evening he knows the next steps", [["parent evening", "der Elternabend", "noun"], ["deadline", "die Frist", "noun"], ["information", "die Information", "noun"], ["next steps", "die nächsten Schritte", "noun"], ["to take notes", "Notizen machen", "phrase"]]],
  ["b2-krankenkasse-wechsel", "B2", "gesundheit", "Wechsel der Krankenkasse", "Changing health insurance, carefully.", "Anja", "am Telefon", "on the phone", "Sie überlegt, die Krankenkasse zu wechseln", "She is considering changing health insurance", "Sie fragt nach Zusatzbeitrag, Leistungen und Kündigungsfrist", "She asks about additional contribution, benefits, and notice period", "Danach vergleicht sie die Informationen in Ruhe", "Afterward she compares the information calmly", [["health insurance provider", "die Krankenkasse", "noun"], ["additional contribution", "der Zusatzbeitrag", "noun"], ["benefits", "die Leistungen", "noun"], ["notice period", "die Kündigungsfrist", "noun"], ["to compare", "vergleichen", "verb"]]],
  ["b2-arbeitszeugnis", "B2", "arbeit", "Das Arbeitszeugnis", "Understanding a German work reference.", "Erik", "zu Hause", "at home", "Er bekommt sein Arbeitszeugnis und findet eine Formulierung seltsam", "He receives his work reference and finds one phrase strange", "Er recherchiert die Bedeutung und fragt eine Kollegin um Rat", "He researches the meaning and asks a colleague for advice", "Danach bittet er höflich um eine klarere Formulierung", "Afterward he politely asks for a clearer wording", [["work reference", "das Arbeitszeugnis", "noun"], ["wording", "die Formulierung", "noun"], ["strange", "seltsam", "adjective"], ["meaning", "die Bedeutung", "noun"], ["advice", "der Rat", "noun"]]],
  ["b2-dokument-uebersetzung", "B2", "behörden", "Eine beglaubigte Übersetzung", "Official translation for paperwork.", "Nadia", "im Übersetzungsbüro", "at the translation office", "Das Amt verlangt eine beglaubigte Übersetzung", "The authority requires a certified translation", "Sie fragt nach Bearbeitungszeit und Kosten", "She asks about processing time and costs", "Eine Woche später holt sie das fertige Dokument ab", "One week later she picks up the finished document", [["certified translation", "die beglaubigte Übersetzung", "noun"], ["authority", "das Amt", "noun"], ["processing time", "die Bearbeitungszeit", "noun"], ["the cost", "die Kosten", "noun"], ["to pick up", "abholen", "verb"]]],
  ["b2-projekt-risiko", "B2", "arbeit", "Ein Risiko im Projekt", "Raising project risk early.", "Kian", "im Projektmeeting", "in the project meeting", "Ein wichtiger Lieferant meldet eine Verzögerung", "An important supplier reports a delay", "Kian spricht das Risiko früh an und schlägt einen Plan B vor", "Kian raises the risk early and suggests a plan B", "Das Team kann rechtzeitig reagieren", "The team can react in time", [["the risk", "das Risiko", "noun"], ["supplier", "der Lieferant", "noun"], ["delay", "die Verzögerung", "noun"], ["Plan B", "der Plan B", "noun"], ["to react", "reagieren", "verb"]]],
  ["b2-bankberatung", "B2", "alltag", "Beratung bei der Bank", "Careful financial language.", "Selin", "in der Bankfiliale", "in the bank branch", "Sie möchte die Gebühren ihres Kontos besser verstehen", "She wants to understand the fees of her account better", "Sie bittet um eine transparente Übersicht", "She asks for a transparent overview", "Nach der Beratung wechselt sie in ein passenderes Kontomodell", "After the consultation she switches to a more suitable account model", [["consultation", "die Beratung", "noun"], ["bank branch", "die Bankfiliale", "noun"], ["fees", "die Gebühren", "noun"], ["overview", "die Übersicht", "noun"], ["suitable", "passend", "adjective"]]]
];

storyBank.push(...extraStorySeeds.map(createGeneratedStory));

function createGeneratedStory(seed) {
  const [
    id,
    level,
    topic,
    title,
    intro,
    name,
    settingDe,
    settingEn,
    problemDe,
    problemEn,
    actionDe,
    actionEn,
    resultDe,
    resultEn,
    vocab,
  ] = seed;
  return {
    id,
    level,
    topic,
    title,
    intro,
    vocab,
    paragraphs: [
      `Am Nachmittag ist ${name} ${settingDe}. ${problemDe}.`,
      `${name} bleibt ruhig. ${actionDe}.`,
      `${resultDe}.`,
    ],
    questions: [
      makeGeneratedStoryQuestion(`Wo ist ${name}?`, `Where is ${name}?`, settingDe, settingEn, generatedStoryChoicePools.places_de, generatedStoryChoicePools.places_en),
      makeGeneratedStoryQuestion("Was passiert zuerst?", "What happens first?", problemDe, problemEn, generatedStoryChoicePools.problems_de, generatedStoryChoicePools.problems_en),
      makeGeneratedStoryQuestion(`Was macht ${name}?`, `What does ${name} do?`, actionDe, actionEn, generatedStoryChoicePools.actions_de, generatedStoryChoicePools.actions_en),
      makeGeneratedStoryQuestion("Was passiert am Ende?", "What happens in the end?", resultDe, resultEn, generatedStoryChoicePools.endings_de, generatedStoryChoicePools.endings_en),
    ],
  };
}

function makeGeneratedStoryQuestion(q_de, q_en, answerDe, answerEn, distractorsDe, distractorsEn) {
  const options_de = [answerDe];
  const options_en = [answerEn];
  distractorsDe.forEach((optionDe, index) => {
    if (options_de.length >= 4 || normalizeAnswer(optionDe) === normalizeAnswer(answerDe)) return;
    options_de.push(optionDe);
    options_en.push(distractorsEn[index]);
  });
  return { q_de, q_en, options_de, options_en, answer: 0 };
}

let db = loadDb();
let activeRound = null;
let activeStory = null;
let activeStatusFilter = "learning";
let lastStatusMoveMessage = "";

const els = {
  appShell: document.querySelector(".app-shell"),
  totalWords: document.querySelector("#totalWords"),
  learningWords: document.querySelector("#learningWords"),
  masteredWords: document.querySelector("#masteredWords"),
  roundCount: document.querySelector("#roundCount"),
  quickBestScore: document.querySelector("#quickBestScore"),
  fullBestScore: document.querySelector("#fullBestScore"),
  retryBestScore: document.querySelector("#retryBestScore"),
  choiceBestScore: document.querySelector("#choiceBestScore"),
  streakCount: document.querySelector("#streakCount"),
  storageStatus: document.querySelector("#storageStatus"),
  masteryLabel: document.querySelector("#masteryLabel"),
  masteryBar: document.querySelector("#masteryBar"),
  masteryCaption: document.querySelector("#masteryCaption"),
  dayStreak: document.querySelector("#dayStreak"),
  todayMissionCard: document.querySelector("#todayMissionCard"),
  missionTitle: document.querySelector("#missionTitle"),
  missionDetails: document.querySelector("#missionDetails"),
  startMissionBtn: document.querySelector("#startMissionBtn"),
  weeklyGoalTitle: document.querySelector("#weeklyGoalTitle"),
  weeklyGoalDaysLeft: document.querySelector("#weeklyGoalDaysLeft"),
  weeklyGoalBar: document.querySelector("#weeklyGoalBar"),
  weeklyGoalCaption: document.querySelector("#weeklyGoalCaption"),
  wordsSeen: document.querySelector("#wordsSeen"),
  dashboardAccuracy: document.querySelector("#dashboardAccuracy"),
  masteredGoal: document.querySelector("#masteredGoal"),
  newBar: document.querySelector("#newBar"),
  learningBar: document.querySelector("#learningBar"),
  masteredBar: document.querySelector("#masteredBar"),
  statusNewCount: document.querySelector("#statusNewCount"),
  statusLearningCount: document.querySelector("#statusLearningCount"),
  statusMasteredCount: document.querySelector("#statusMasteredCount"),
  wordManagerSummary: document.querySelector("#wordManagerSummary"),
  statusLearningBtn: document.querySelector("#statusLearningBtn"),
  statusMasteredBtn: document.querySelector("#statusMasteredBtn"),
  statusNewBtn: document.querySelector("#statusNewBtn"),
  learningListCount: document.querySelector("#learningListCount"),
  masteredListCount: document.querySelector("#masteredListCount"),
  newListCount: document.querySelector("#newListCount"),
  statusWordList: document.querySelector("#statusWordList"),
  sessionBars: document.querySelector("#sessionBars"),
  dashboardPanel: document.querySelector("#dashboardPanel"),
  recapPanel: document.querySelector("#recapPanel"),
  dashboardToggleBtn: document.querySelector("#dashboardToggleBtn"),
  recapToggleBtn: document.querySelector("#recapToggleBtn"),
  closeDashboardBtn: document.querySelector("#closeDashboardBtn"),
  closeRecapBtn: document.querySelector("#closeRecapBtn"),
  startScreen: document.querySelector("#startScreen"),
  welcomeCard: document.querySelector("#welcomeCard"),
  roundMenu: document.querySelector("#roundMenu"),
  quizHeader: document.querySelector("#quizHeader"),
  quickRoundBtn: document.querySelector("#quickRoundBtn"),
  fullRoundBtn: document.querySelector("#fullRoundBtn"),
  retryBtn: document.querySelector("#retryBtn"),
  multipleChoiceBtn: document.querySelector("#multipleChoiceBtn"),
  storyModeBtn: document.querySelector("#storyModeBtn"),
  exitRoundBtn: document.querySelector("#exitRoundBtn"),
  refreshPhraseBtn: document.querySelector("#refreshPhraseBtn"),
  phraseGerman: document.querySelector("#phraseGerman"),
  phraseMeaning: document.querySelector("#phraseMeaning"),
  phraseNote: document.querySelector("#phraseNote"),
  greetingName: document.querySelector("#greetingName"),
  profileNameForm: document.querySelector("#profileNameForm"),
  profileNameInput: document.querySelector("#profileNameInput"),
  profileNameStatus: document.querySelector("#profileNameStatus"),
  levelButtons: document.querySelector("#levelButtons"),
  profileLevelStatus: document.querySelector("#profileLevelStatus"),
  weeklyGoalForm: document.querySelector("#weeklyGoalForm"),
  weeklyGoalInput: document.querySelector("#weeklyGoalInput"),
  weeklyGoalStatus: document.querySelector("#weeklyGoalStatus"),
  profilePrompt: document.querySelector("#profilePrompt"),
  profilePromptForm: document.querySelector("#profilePromptForm"),
  profilePromptInput: document.querySelector("#profilePromptInput"),
  profilePromptLevel: document.querySelector("#profilePromptLevel"),
  quizTitle: document.querySelector("#quizTitle"),
  roundMeta: document.querySelector("#roundMeta"),
  coachMessage: document.querySelector("#coachMessage"),
  quizForm: document.querySelector("#quizForm"),
  choiceQuiz: document.querySelector("#choiceQuiz"),
  choiceProgress: document.querySelector("#choiceProgress"),
  choiceScore: document.querySelector("#choiceScore"),
  choicePrompt: document.querySelector("#choicePrompt"),
  choiceOptions: document.querySelector("#choiceOptions"),
  dontKnowChoiceBtn: document.querySelector("#dontKnowChoiceBtn"),
  storyPanel: document.querySelector("#storyPanel"),
  promptList: document.querySelector("#promptList"),
  resultsPanel: document.querySelector("#resultsPanel"),
  addWordsText: document.querySelector("#addWordsText"),
  addWordsBtn: document.querySelector("#addWordsBtn"),
  addWordsStatus: document.querySelector("#addWordsStatus"),
  hardWordsList: document.querySelector("#hardWordsList"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  importCsvInput: document.querySelector("#importCsvInput"),
  sampleCsvBtn: document.querySelector("#sampleCsvBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  rowTemplate: document.querySelector("#answerRowTemplate"),
};

function createSeedDb() {
  const now = new Date().toISOString();
  return {
    version: STARTER_BANK_VERSION,
    created_at: now,
    words: getStarterWordRows().map((row, index) => ({
      id: `seed-${String(index + 1).padStart(3, "0")}`,
      word_en: row[0],
      word_de: row[1],
      part_of_speech: row[2],
      topic: row[3],
      status: "new",
      correct_streak: 0,
      times_seen: 0,
      wrong_count: 0,
    half_count: 0,
    last_seen: "",
    last_result: "",
    last_missed_at: "",
    last_missed_round_id: "",
    difficulty: row[4],
    notes: row[5],
    created_at: now,
    })),
    sessions: [],
    profile: createProfile(),
  };
}

function createStorageAdapter() {
  const memory = { value: "" };
  try {
    const testKey = `${STORAGE_KEY}_test`;
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return {
      persistent: true,
      get: () => window.localStorage.getItem(STORAGE_KEY),
      set: (value) => window.localStorage.setItem(STORAGE_KEY, value),
    };
  } catch {
    return {
      persistent: false,
      get: () => memory.value,
      set: (value) => {
        memory.value = value;
      },
    };
  }
}

function loadDb() {
  const raw = storage.get();
  if (!raw) {
    const seeded = createSeedDb();
    storage.set(JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    const profileBefore = JSON.stringify(parsed.profile || null);
    parsed.words = (parsed.words || []).map(normalizeWordRecord);
    parsed.sessions = parsed.sessions || [];
    parsed.profile = normalizeProfile(parsed.profile, !parsed.profile);
    const addedStarterWords = mergeStarterWords(parsed);
    const profileChanged = JSON.stringify(parsed.profile) !== profileBefore;
    const shouldPersistUpgrade = addedStarterWords || profileChanged || Number(parsed.version || 0) < STARTER_BANK_VERSION;
    parsed.version = STARTER_BANK_VERSION;
    if (shouldPersistUpgrade) storage.set(JSON.stringify(parsed));
    return parsed;
  } catch {
    const seeded = createSeedDb();
    storage.set(JSON.stringify(seeded));
    return seeded;
  }
}

function normalizeWordRecord(word) {
  return {
    id: word.id || makeId(),
    word_de: word.word_de || "",
    word_en: word.word_en || "",
    part_of_speech: word.part_of_speech || guessPartOfSpeech(word.word_en, word.word_de),
    topic: word.topic || guessTopic(word.word_en, word.word_de),
    status: ["new", "learning", "mastered"].includes(word.status) ? word.status : "new",
    correct_streak: Number(word.correct_streak || 0),
    times_seen: Number(word.times_seen || 0),
    wrong_count: Number(word.wrong_count || 0),
    half_count: Number(word.half_count || 0),
    last_seen: word.last_seen || "",
    last_result: word.last_result || "",
    last_missed_at: word.last_missed_at || "",
    last_missed_round_id: word.last_missed_round_id || "",
    difficulty: LEVELS.includes(word.difficulty) ? word.difficulty : DEFAULT_LEVEL,
    notes: word.notes || "",
    created_at: word.created_at || new Date().toISOString(),
  };
}

function createProfile(name = "", hasChosenName = false, level = DEFAULT_LEVEL, weeklyGoal = DEFAULT_WEEKLY_GOAL, hasChosenLevel = false) {
  const cleanName = sanitizeProfileName(name);
  const cleanLevel = normalizeLevel(level);
  const cleanWeeklyGoal = normalizeWeeklyGoal(weeklyGoal);
  return {
    name: cleanName,
    hasChosenName: Boolean(cleanName && hasChosenName),
    level: cleanLevel,
    hasChosenLevel: Boolean(hasChosenLevel),
    weeklyGoal: cleanWeeklyGoal,
  };
}

function normalizeProfile(profile, useLegacyName = false) {
  if (!profile && useLegacyName) return createProfile(LEGACY_PROFILE_NAME, true, DEFAULT_LEVEL, DEFAULT_WEEKLY_GOAL, true);
  const cleanName = sanitizeProfileName(profile?.name || "");
  const hasChosenName = Boolean(profile?.hasChosenName || cleanName);
  const hasChosenLevel = Boolean(profile?.hasChosenLevel || cleanName || useLegacyName);
  return createProfile(cleanName, hasChosenName, profile?.level || DEFAULT_LEVEL, profile?.weeklyGoal || DEFAULT_WEEKLY_GOAL, hasChosenLevel);
}

function sanitizeProfileName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 32);
}

function normalizeLevel(value) {
  return LEVELS.includes(value) ? value : DEFAULT_LEVEL;
}

function normalizeWeeklyGoal(value) {
  const goal = Number(value || DEFAULT_WEEKLY_GOAL);
  if (!Number.isFinite(goal)) return DEFAULT_WEEKLY_GOAL;
  return Math.max(5, Math.min(100, Math.round(goal / 5) * 5));
}

function getStarterWordRows() {
  const rows = [...starterWords, ...supplementalStarterWords];
  const seen = new Set();
  return rows.filter((row) => {
    const key = normalizeAnswer(`${row[0]}|${row[1]}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeStarterWords(database) {
  const existingKeys = new Set(database.words.map((word) => normalizeAnswer(`${word.word_en}|${word.word_de}`)));
  let added = 0;
  getStarterWordRows().forEach((row, index) => {
    const key = normalizeAnswer(`${row[0]}|${row[1]}`);
    if (existingKeys.has(key)) return;
    database.words.push(
      normalizeWordRecord({
        id: `seed-${String(index + 1).padStart(3, "0")}`,
        word_en: row[0],
        word_de: row[1],
        part_of_speech: row[2],
        topic: row[3],
        status: "new",
        correct_streak: 0,
        times_seen: 0,
        wrong_count: 0,
        half_count: 0,
        last_seen: "",
        last_result: "",
        last_missed_at: "",
        last_missed_round_id: "",
        difficulty: row[4],
        notes: row[5],
        created_at: new Date().toISOString(),
      })
    );
    existingKeys.add(key);
    added += 1;
  });
  return added;
}

function saveDb() {
  storage.set(JSON.stringify(db));
  renderDashboard();
  renderProfile();
}

function saveProfileName(rawName, { fromPrompt = false } = {}) {
  const name = sanitizeProfileName(rawName);
  if (!name) {
    if (els.profileNameStatus) els.profileNameStatus.textContent = "Add a name first.";
    return false;
  }

  db.profile = createProfile(name, true, db.profile?.level, db.profile?.weeklyGoal, db.profile?.hasChosenLevel);
  storage.set(JSON.stringify(db));
  renderProfile();
  if (els.profileNameStatus) els.profileNameStatus.textContent = `Saved. Hello ${name}.`;
  if (fromPrompt) closeProfilePrompt();
  return true;
}

function saveProfileSetup(rawName, level) {
  const name = sanitizeProfileName(rawName);
  if (!name) return false;
  db.profile = createProfile(name, true, level, db.profile?.weeklyGoal, true);
  storage.set(JSON.stringify(db));
  renderProfile();
  renderDashboard();
  closeProfilePrompt();
  return true;
}

function saveProfileLevel(level) {
  db.profile = createProfile(db.profile?.name, db.profile?.hasChosenName, level, db.profile?.weeklyGoal, true);
  storage.set(JSON.stringify(db));
  renderProfile();
  renderHomeProgress();
  els.profileLevelStatus.textContent = `${db.profile.level} mode active. The app will choose words at that level.`;
}

function saveWeeklyGoal(rawGoal) {
  db.profile = createProfile(db.profile?.name, db.profile?.hasChosenName, db.profile?.level, rawGoal, db.profile?.hasChosenLevel);
  storage.set(JSON.stringify(db));
  renderProfile();
  renderDashboard();
  els.weeklyGoalStatus.textContent = `Weekly goal set to ${db.profile.weeklyGoal} words.`;
}

function renderProfile() {
  const name = db.profile?.name || "there";
  els.greetingName.textContent = name;
  els.profileNameInput.value = db.profile?.name || "";
  els.weeklyGoalInput.value = String(db.profile?.weeklyGoal || DEFAULT_WEEKLY_GOAL);
  els.profilePromptLevel.value = normalizeLevel(db.profile?.level);
  [...els.levelButtons.querySelectorAll("[data-level-option]")].forEach((button) => {
    const active = button.dataset.levelOption === normalizeLevel(db.profile?.level);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function shouldAskForProfileName() {
  return !db.profile?.hasChosenName || !db.profile?.name || !db.profile?.hasChosenLevel;
}

function openProfilePrompt() {
  els.profilePrompt.hidden = false;
  els.profilePromptInput.value = "";
  window.setTimeout(() => els.profilePromptInput.focus(), 0);
}

function closeProfilePrompt() {
  els.profilePrompt.hidden = true;
}

function handleProfilePromptSubmit(event) {
  event.preventDefault();
  saveProfileSetup(els.profilePromptInput.value, els.profilePromptLevel.value);
}

function handleProfileNameSubmit(event) {
  event.preventDefault();
  saveProfileName(els.profileNameInput.value);
}

function handleLevelClick(event) {
  const button = event.target.closest("[data-level-option]");
  if (!button) return;
  saveProfileLevel(button.dataset.levelOption);
}

function handleWeeklyGoalSubmit(event) {
  event.preventDefault();
  saveWeeklyGoal(els.weeklyGoalInput.value);
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionNumber() {
  return db.sessions.filter((session) => !session.skipped).length + 1;
}

function getSessionMode(session) {
  if (session.mode) return session.mode;
  if (session.retry_only) return "retry";
  if (Number(session.score_total || 0) === 10) return "choice";
  if (Number(session.score_total || 0) <= 5) return "quick";
  return "full";
}

function getRoundMode({ mode, retryOnly, roundSize, mission }) {
  if (mission) return "mission";
  if (mode === "choice") return "choice";
  if (retryOnly) return "retry";
  return Number(roundSize || 0) <= 5 ? "quick" : "full";
}

function getBestSession(mode) {
  return db.sessions
    .filter((session) => !session.skipped && getSessionMode(session) === mode)
    .sort(
      (a, b) =>
        Number(b.accuracy || 0) - Number(a.accuracy || 0) ||
        Number(b.score_correct || 0) - Number(a.score_correct || 0)
    )[0];
}

function getBestScoreLabel(mode, fallbackTotal) {
  const best = getBestSession(mode);
  if (!best) return fallbackTotal ? `0/${fallbackTotal}` : "--";
  return `${best.score_correct}/${best.score_total}`;
}

function getCurrentStreak() {
  let streak = 0;
  for (let i = db.sessions.length - 1; i >= 0; i -= 1) {
    const session = db.sessions[i];
    if (session.skipped) continue;
    if (Number(session.accuracy || 0) >= 70) streak += 1;
    else break;
  }
  return streak;
}

function getRecentWordIds(sessionCount) {
  return new Set(
    db.sessions
      .filter((session) => !session.skipped)
      .slice(-sessionCount)
      .flatMap((session) => session.words_ids || [])
  );
}

function getUserLevel() {
  return normalizeLevel(db.profile?.level);
}

function levelIndex(level) {
  const index = LEVELS.indexOf(normalizeLevel(level));
  return index < 0 ? LEVELS.indexOf(DEFAULT_LEVEL) : index;
}

function wordLevelIndex(word) {
  return levelIndex(word.difficulty);
}

function isNewWordLevelEligible(word) {
  return wordLevelIndex(word) <= Math.min(LEVELS.length - 1, levelIndex(getUserLevel()) + 1);
}

function levelFitScore(word) {
  const userIndex = levelIndex(getUserLevel());
  const wordIndex = wordLevelIndex(word);
  if (wordIndex === userIndex) return 14;
  if (wordIndex === userIndex - 1) return 8;
  if (wordIndex === userIndex + 1) return 5;
  if (wordIndex < userIndex - 1) return 2;
  return -16;
}

function pickRound({ retryOnly = false, size = ROUND_SIZE, mission = false } = {}) {
  const targetSize = Math.max(1, Math.min(size, db.words.length || size));
  const selected = [];
  const selectedIds = new Set();
  const recentTwo = getRecentWordIds(2);
  const recentFive = getRecentWordIds(5);
  const quotas = getRoundQuotas(targetSize, mission);

  const addFrom = (words, limit) => {
    for (const word of words) {
      if (selected.length >= targetSize || selectedIds.has(word.id)) continue;
      if (limit !== undefined && selected.filter((item) => item.bucket === word.bucket).length >= limit) continue;
      selected.push(word);
      selectedIds.add(word.id);
    }
  };

  const learning = db.words
    .filter((word) => word.status === "learning")
    .map((word) => ({ ...word, bucket: "learning" }))
    .sort((a, b) => difficultyScore(b, recentTwo) + levelFitScore(b) - (difficultyScore(a, recentTwo) + levelFitScore(a)));

  if (retryOnly) {
    addFrom(learning, targetSize);
    return selected.slice(0, targetSize);
  }

  const newWords = db.words
    .filter((word) => word.status === "new" && isNewWordLevelEligible(word))
    .map((word) => ({ ...word, bucket: "new" }))
    .sort((a, b) => newWordScore(b, recentTwo) - newWordScore(a, recentTwo));

  const mastered = db.words
    .filter((word) => word.status === "mastered" && !recentFive.has(word.id))
    .map((word) => ({ ...word, bucket: "mastered" }))
    .sort((a, b) => levelFitScore(b) - levelFitScore(a) || (a.last_seen || "").localeCompare(b.last_seen || ""));

  addFrom(learning, quotas.learning);
  addFrom(newWords, quotas.new);
  addFrom(mastered, quotas.mastered);

  const fillers = [...learning, ...newWords, ...mastered, ...db.words.map((word) => ({ ...word, bucket: word.status }))]
    .filter((word) => !recentTwo.has(word.id) || db.words.length < targetSize * 2)
    .sort((a, b) => fillScore(b) + levelFitScore(b) - (fillScore(a) + levelFitScore(a)));

  addFrom(fillers, targetSize);
  return shuffle(selected).slice(0, targetSize);
}

function getRoundQuotas(size, mission = false) {
  if (mission) {
    return { learning: 3, new: 3, mastered: 2 };
  }
  if (size <= 5) {
    return { learning: 2, new: 3, mastered: 0 };
  }
  if (size >= 20) {
    return { learning: 7, new: 8, mastered: 5 };
  }
  const mastered = Math.max(1, Math.round(size * 0.2));
  const learning = Math.max(2, Math.round(size * 0.4));
  return {
    learning,
    mastered,
    new: Math.max(0, size - learning - mastered),
  };
}

function difficultyScore(word, recentSet) {
  let score = 20 - word.correct_streak * 3 + word.wrong_count * 4 + word.half_count * 2;
  if (word.last_result === "wrong") score += 10;
  if (word.last_result === "half") score += 7;
  if (recentSet.has(word.id)) score -= 8;
  return score;
}

function newWordScore(word, recentSet) {
  const topicBoosts = {
    alltag: 10,
    haushalt: 9,
    arbeit: 9,
    transport: 8,
    gefühle: 8,
    gesundheit: 8,
    freizeit: 7,
    behörden: 7,
  };
  const difficultyBoost = word.difficulty === "B1" ? 7 : word.difficulty === "A2" ? 4 : 3;
  return (topicBoosts[word.topic] || 4) + difficultyBoost + levelFitScore(word) - (recentSet.has(word.id) ? 6 : 0);
}

function fillScore(word) {
  const statusScore = word.status === "learning" ? 20 : word.status === "new" ? 14 : 5;
  return statusScore + Number(word.wrong_count || 0) * 3 - Number(word.correct_streak || 0);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startRound(options = {}) {
  const roundSize = options.size || ROUND_SIZE;
  const words = pickRound({ ...options, size: roundSize });
  if (!words.length) {
    els.coachMessage.textContent = "No words in the bank yet. Add or import a CSV and we'll get rolling.";
    return;
  }

  activeRound = {
    id: `round-${Date.now()}`,
    roundNumber: getSessionNumber(),
    retryOnly: Boolean(options.retryOnly),
    mission: Boolean(options.mission),
    mode: options.mode || "typed",
    roundSize: words.length,
    words,
    choiceIndex: 0,
    choiceResults: [],
    startedAt: new Date().toISOString(),
  };
  activeRound.sessionMode = getRoundMode({
    mode: activeRound.mode,
    retryOnly: activeRound.retryOnly,
    roundSize: activeRound.roundSize,
    mission: activeRound.mission,
  });

  activeStory = null;
  setQuizMode(true);
  els.resultsPanel.innerHTML = "";
  els.quizForm.hidden = activeRound.mode !== "typed";
  els.choiceQuiz.hidden = activeRound.mode !== "choice";
  els.storyPanel.hidden = true;
  els.promptList.innerHTML = "";
  els.choiceOptions.innerHTML = "";
  els.quizTitle.textContent =
    activeRound.mission
      ? "Today's Mission"
      : activeRound.mode === "choice"
      ? "Multiple choice"
      : options.retryOnly
        ? "Retry round: hard words only"
        : `Translate these ${activeRound.roundSize} words`;
  els.roundMeta.textContent = `Round ${activeRound.roundNumber} · Score to beat: ${getBestScoreLabel(activeRound.sessionMode, activeRound.roundSize)}`;
  els.coachMessage.textContent =
    activeRound.mission
      ? `${getUserLevel()} mission: 8 words, no noise, just progress.`
      : activeRound.mode === "choice"
      ? "Pick the German answer. Four doors, one correct exit."
      : "English → German. Nouns need their article. No hints, no mercy, let's cook.";

  if (activeRound.mode === "choice") {
    renderChoiceQuestion();
    return;
  }

  words.forEach((word) => {
    const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".prompt-text").textContent = toPrompt(word.word_en);
    row.querySelector("input").dataset.wordId = word.id;
    els.promptList.appendChild(row);
  });
  const firstInput = els.promptList.querySelector("input");
  if (firstInput) firstInput.focus();
}

function setQuizMode(isActive) {
  els.appShell.classList.toggle("quiz-active", isActive);
  els.appShell.classList.remove("results-active");
  els.startScreen.hidden = isActive;
  els.welcomeCard.hidden = isActive;
  els.roundMenu.hidden = isActive;
  els.quizHeader.hidden = !isActive;
  if (isActive) closeUtilityPanels();
}

function setResultsMode() {
  els.appShell.classList.remove("quiz-active");
  els.appShell.classList.add("results-active");
  els.startScreen.hidden = false;
  els.welcomeCard.hidden = true;
  els.roundMenu.hidden = false;
  els.quizHeader.hidden = true;
  els.storyPanel.hidden = true;
  closeUtilityPanels();
}

function setHomeMode() {
  els.appShell.classList.remove("quiz-active", "results-active");
  els.startScreen.hidden = false;
  els.welcomeCard.hidden = false;
  els.roundMenu.hidden = false;
  els.quizHeader.hidden = true;
  els.storyPanel.hidden = true;
}

function exitRound() {
  activeRound = null;
  activeStory = null;
  els.quizForm.hidden = true;
  els.choiceQuiz.hidden = true;
  els.storyPanel.hidden = true;
  els.promptList.innerHTML = "";
  els.choiceOptions.innerHTML = "";
  els.dontKnowChoiceBtn.disabled = false;
  els.dontKnowChoiceBtn.classList.remove("wrong-choice");
  els.resultsPanel.innerHTML = "";
  els.coachMessage.textContent = "Round parked. Pick a sprint when you're ready.";
  setHomeMode();
}

function closeUtilityPanels() {
  els.dashboardPanel.hidden = true;
  els.recapPanel.hidden = true;
}

function toggleDashboard() {
  const shouldOpen = els.dashboardPanel.hidden;
  closeUtilityPanels();
  els.dashboardPanel.hidden = !shouldOpen;
}

function toggleRecap() {
  const shouldOpen = els.recapPanel.hidden;
  closeUtilityPanels();
  els.recapPanel.hidden = !shouldOpen;
}

function handleOutsidePanelClick(event) {
  const hasOpenPanel = !els.dashboardPanel.hidden || !els.recapPanel.hidden;
  if (!hasOpenPanel) return;

  const target = event.target;
  const clickedPanel = els.dashboardPanel.contains(target) || els.recapPanel.contains(target);
  const clickedToggle = els.dashboardToggleBtn.contains(target) || els.recapToggleBtn.contains(target);
  if (!clickedPanel && !clickedToggle) closeUtilityPanels();
}

function handleEscapeKey(event) {
  if (event.key === "Escape") closeUtilityPanels();
}

function toPrompt(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderChoiceQuestion() {
  if (!activeRound || activeRound.mode !== "choice") return;
  const word = activeRound.words[activeRound.choiceIndex];
  if (!word) {
    finishChoiceRound();
    return;
  }

  const correctSoFar = activeRound.choiceResults.filter((item) => item.result === "correct").length;
  els.choiceProgress.textContent = `Question ${activeRound.choiceIndex + 1}/${activeRound.roundSize}`;
  els.choiceScore.textContent = `${correctSoFar} correct`;
  els.choicePrompt.textContent = toPrompt(word.word_en);
  els.choiceOptions.innerHTML = "";
  els.dontKnowChoiceBtn.disabled = false;
  els.dontKnowChoiceBtn.classList.remove("wrong-choice");

  getChoiceOptions(word).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-option";
    button.textContent = option.word_de;
    button.dataset.wordId = option.id;
    button.addEventListener("click", () => handleChoiceAnswer(option, button));
    els.choiceOptions.appendChild(button);
  });
}

function getChoiceOptions(correctWord) {
  const sameType = db.words.filter(
    (word) => word.id !== correctWord.id && word.part_of_speech === correctWord.part_of_speech
  );
  const fallback = db.words.filter((word) => word.id !== correctWord.id);
  const distractors = shuffle(sameType.length >= 3 ? sameType : fallback)
    .filter((word, index, words) => words.findIndex((item) => normalizeAnswer(item.word_de) === normalizeAnswer(word.word_de)) === index)
    .slice(0, 3);
  return shuffle([correctWord, ...distractors]);
}

function handleChoiceAnswer(option, button) {
  if (!activeRound || activeRound.mode !== "choice") return;
  const word = activeRound.words[activeRound.choiceIndex];
  const skipped = !option;
  const result = option?.id === word.id ? "correct" : "wrong";
  activeRound.choiceResults.push({
    word,
    answer: option?.word_de || "I don't know",
    result,
    comment: result === "correct" ? "" : skipped ? "didn't know" : "multiple choice miss",
  });

  [...els.choiceOptions.querySelectorAll("button")].forEach((optionButton) => {
    optionButton.disabled = true;
    if (optionButton.dataset.wordId === word.id) optionButton.classList.add("correct-choice");
  });
  els.dontKnowChoiceBtn.disabled = true;
  if (result === "wrong") button.classList.add("wrong-choice");

  window.setTimeout(() => {
    if (!activeRound) return;
    activeRound.choiceIndex += 1;
    renderChoiceQuestion();
  }, 520);
}

function finishChoiceRound() {
  const graded = activeRound.choiceResults;
  applyResults(graded);
  renderResults(graded);
  activeRound = null;
  els.choiceQuiz.hidden = true;
  setResultsMode();
  saveDb();
}

function submitAnswers(event) {
  event.preventDefault();
  if (!activeRound) return;

  const inputs = [...els.promptList.querySelectorAll("input")];
  const graded = activeRound.words.map((word, index) => {
    const answer = inputs[index]?.value || "";
    return {
      word,
      answer,
      ...gradeAnswer(answer, word),
    };
  });

  applyResults(graded);
  renderResults(graded);
  activeRound = null;
  els.quizForm.hidden = true;
  setResultsMode();
  saveDb();
}

function gradeAnswer(answer, word) {
  const expected = word.word_de.trim();
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(expected);

  if (!normalizedAnswer) {
    return { result: "wrong", comment: "blank answer" };
  }

  if (normalizedAnswer === normalizedExpected) {
    return { result: "correct", comment: answer.includes("ss") && expected.includes("ß") ? "ss accepted for ß" : "" };
  }

  const isNoun = word.part_of_speech === "noun";
  if (isNoun) {
    const expectedParts = splitArticle(expected);
    const answerParts = splitArticle(answer);
    if (expectedParts.lemma && normalizeAnswer(answerParts.lemma) === normalizeAnswer(expectedParts.lemma)) {
      return { result: "half", comment: "article slip" };
    }
    if (levenshtein(normalizeAnswer(answerParts.lemma || answer), normalizeAnswer(expectedParts.lemma)) <= 2) {
      return { result: "half", comment: "spelling slip" };
    }
  }

  if (levenshtein(normalizedAnswer, normalizedExpected) <= Math.max(1, Math.floor(normalizedExpected.length * 0.16))) {
    return { result: "half", comment: "spelling slip" };
  }

  return { result: "wrong", comment: "" };
}

function splitArticle(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(der|die|das|den|dem|des|eine|ein|einen|einem|einer)\s+(.+)$/i);
  if (!match) return { article: "", lemma: trimmed };
  return { article: match[1].toLowerCase(), lemma: match[2] };
}

function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\u0308/g, "e")
    .replace(/\u0301|\u0300|\u0302/g, "")
    .replace(/ß/g, "ss")
    .replace(/[.,!?;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

function applyResults(graded) {
  const scoreCorrect = graded.filter((item) => item.result === "correct").length;
  const wordsById = new Map(db.words.map((word) => [word.id, word]));
  const today = TODAY();
  const nowIso = new Date().toISOString();
  const missedItems = graded.filter((item) => item.result === "wrong" || item.result === "half");

  graded.forEach((item) => {
    const word = wordsById.get(item.word.id);
    if (!word) return;
    word.times_seen += 1;
    word.last_seen = today;
    word.last_result = item.result;
    if (item.result === "correct") {
      word.correct_streak += 1;
      if (word.status === "new") word.status = "learning";
      if (word.correct_streak >= 3) word.status = "mastered";
    } else if (item.result === "half") {
      word.half_count += 1;
      word.last_missed_at = nowIso;
      word.last_missed_round_id = activeRound.id;
      if (word.status === "new") word.status = "learning";
    } else {
      word.correct_streak = 0;
      word.wrong_count += 1;
      word.last_missed_at = nowIso;
      word.last_missed_round_id = activeRound.id;
      word.status = "learning";
    }
  });

  const counts = graded.reduce(
    (acc, item) => {
      acc[item.word.bucket || item.word.status] = (acc[item.word.bucket || item.word.status] || 0) + 1;
      return acc;
    },
    { new: 0, learning: 0, mastered: 0 }
  );

  db.sessions.push({
    round_id: activeRound.id,
    date: new Date().toISOString(),
    score_correct: scoreCorrect,
    score_total: activeRound.roundSize,
    accuracy: Math.round((scoreCorrect / activeRound.roundSize) * 100),
    words_ids: graded.map((item) => item.word.id),
    count_new: counts.new || 0,
    count_learning: counts.learning || 0,
    count_mastered_review: counts.mastered || 0,
    missed_word_ids: missedItems.map((item) => item.word.id),
    wrong_word_ids: graded.filter((item) => item.result === "wrong").map((item) => item.word.id),
    half_word_ids: graded.filter((item) => item.result === "half").map((item) => item.word.id),
    retry_only: activeRound.retryOnly,
    mode: activeRound.sessionMode,
    level: getUserLevel(),
  });
}

function renderResults(graded) {
  const correct = graded.filter((item) => item.result === "correct");
  const half = graded.filter((item) => item.result === "half");
  const wrong = graded.filter((item) => item.result === "wrong");
  const score = correct.length;
  const total = activeRound.roundSize;
  const accuracy = Math.round((score / total) * 100);
  const bestScoreLabel = getBestScoreLabel(activeRound.sessionMode, total);
  const currentStreak = getCurrentStreak();

  els.coachMessage.textContent = getMotivation(score, total);
  els.resultsPanel.innerHTML = `
    <div class="result-summary">
      <article><small>Score</small><strong>${score}/${total}</strong></article>
      <article><small>Accuracy</small><strong>${accuracy}%</strong></article>
      <article><small>70% streak</small><strong>${currentStreak}</strong></article>
      <article><small>Best</small><strong>${bestScoreLabel}</strong></article>
    </div>
    ${renderResultGroup("✅ Correct", correct, "correct")}
    ${renderResultGroup("⚠️ Gender/spelling slip", half, "half")}
    ${renderResultGroup("❌ Wrong", wrong, "wrong")}
  `;
}

function renderResultGroup(title, items, className) {
  if (!items.length) {
    return `<section class="result-group"><h3>${title}</h3><p class="${className}">None this round.</p></section>`;
  }

  const rows = items
    .map((item) => {
      const position = activeRound.words.findIndex((word) => word.id === item.word.id) + 1;
      if (item.result === "correct") {
        const note = item.comment ? ` <span class="half">(${escapeHtml(item.comment)})</span>` : "";
        return `<li>${position}. ${escapeHtml(toPrompt(item.word.word_en))} – <strong>${escapeHtml(item.word.word_de)}</strong> ✓${note}</li>`;
      }
      if (item.result === "half") {
        return `<li>${position}. ${escapeHtml(toPrompt(item.word.word_en))} – ${escapeHtml(item.answer || "blank")} → <strong>${escapeHtml(item.word.word_de)}</strong> <span class="half">${escapeHtml(item.comment)}</span></li>`;
      }
      return `<li>${position}. ${escapeHtml(toPrompt(item.word.word_en))} – ${escapeHtml(item.answer || "blank")} → <strong>${escapeHtml(item.word.word_de)}</strong><br><span class="wrong">${escapeHtml(getMemoryTrick(item.word))}</span></li>`;
    })
    .join("");

  return `<section class="result-group"><h3>${title}</h3><ol class="result-list">${rows}</ol></section>`;
}

function getMotivation(score, total) {
  const accuracy = total ? (score / total) * 100 : 0;
  if (accuracy >= 90) return "Absolute unit. 🔥";
  if (accuracy >= 70) return "Solid round. Keep pushing.";
  if (accuracy >= 50) return "Not bad — the tricky ones are coming back for you next round.";
  return "Rough one. But that's exactly what we're here to fix.";
}

function getMemoryTrick(word) {
  const normalized = normalizeAnswer(word.word_de);
  const exactTrick = memoryTricks.find(([key]) => normalized === normalizeAnswer(key));
  if (exactTrick) return `${word.word_de}: ${exactTrick[1]}`;
  const partialTrick = [...memoryTricks]
    .sort((a, b) => normalizeAnswer(b[0]).length - normalizeAnswer(a[0]).length)
    .find(([key]) => normalized.includes(normalizeAnswer(key)));
  if (partialTrick) return `${word.word_de}: ${partialTrick[1]}`;

  if (word.part_of_speech === "noun") {
    return `${word.word_de}: ${buildNounMemoryTrick(word)}`;
  }
  return `${word.word_de}: ${buildGeneralMemoryTrick(word)}`;
}

function buildNounMemoryTrick(word) {
  const { article, lemma } = splitArticle(word.word_de);
  const cleanEnglish = word.word_en.replace(/^the\s+/i, "");
  const endingCue = getEndingCue(article, lemma);
  const compoundCue = getCompoundCue(lemma);
  const articleCue = getArticleCue(article);

  if (compoundCue && endingCue) {
    return `${compoundCue} ${endingCue}`;
  }
  if (compoundCue) {
    return `${compoundCue} Say it as one chunk: ${article} ${lemma}.`;
  }
  if (endingCue) {
    return `${endingCue} Connect ${lemma} directly to "${cleanEnglish}".`;
  }
  return `${articleCue} Link ${lemma} to "${cleanEnglish}" in one picture and always say the article with it.`;
}

function getEndingCue(article, lemma) {
  const lower = lemma.toLowerCase();
  const rules = [
    { suffix: "ung", article: "die", cue: "-ung nouns are almost always DIE" },
    { suffix: "keit", article: "die", cue: "-keit nouns are always DIE" },
    { suffix: "heit", article: "die", cue: "-heit nouns are always DIE" },
    { suffix: "schaft", article: "die", cue: "-schaft nouns are DIE" },
    { suffix: "ion", article: "die", cue: "-ion nouns are DIE" },
    { suffix: "e", article: "die", cue: "many abstract nouns ending in -e are DIE" },
    { suffix: "er", article: "der", cue: "people or devices ending in -er often take DER" },
    { suffix: "automat", article: "der", cue: "Automat is DER, so the whole compound stays DER" },
    { suffix: "zeug", article: "das", cue: "Zeug is DAS, so compounds ending in -zeug are DAS" },
    { suffix: "ment", article: "das", cue: "-ment nouns are usually DAS" },
    { suffix: "amt", article: "das", cue: "Amt is DAS, so the office compound stays DAS" },
    { suffix: "chen", article: "das", cue: "-chen nouns are always DAS" },
  ];
  const rule = rules.find((item) => lower.endsWith(item.suffix) && article === item.article);
  return rule ? `${rule.cue}: ${article} ${lemma}.` : "";
}

function getCompoundCue(lemma) {
  const lower = lemma.toLowerCase();
  const parts = [
    ["kasse", "Kasse = checkout"],
    ["zettel", "Zettel = slip/note"],
    ["bahn", "Bahn = train"],
    ["hof", "Hof = yard"],
    ["steig", "Steig = step/path"],
    ["fahrkarte", "Fahrkarte = ticket"],
    ["automat", "Automat = machine"],
    ["monat", "Monat = month"],
    ["karte", "Karte = card"],
    ["fahrrad", "Fahrrad = bike"],
    ["weg", "Weg = path"],
    ["krank", "krank = sick"],
    ["versicherung", "Versicherung = insurance"],
    ["arzt", "Arzt = doctor"],
    ["termin", "Termin = appointment"],
    ["bürger", "Bürger = citizen"],
    ["amt", "Amt = office"],
    ["aufenthalt", "Aufenthalt = stay"],
    ["titel", "Titel = title/document"],
    ["frei", "frei = free"],
    ["zeit", "Zeit = time"],
    ["müll", "Müll = trash"],
    ["trennung", "Trennung = separation"],
    ["nachbar", "Nachbar = neighbor"],
    ["schaft", "Schaft turns it into a collective noun"],
    ["werk", "Werk = work"],
    ["zeug", "Zeug = stuff"],
    ["weiter", "weiter = further"],
    ["bildung", "Bildung = education"],
    ["über", "über = over/across"],
    ["weisung", "Weisung = direction/instruction"],
  ];
  const hits = parts.filter(([part]) => lower.includes(part)).slice(0, 3);
  if (!hits.length) return "";
  return `${hits.map(([, cue]) => cue).join(", ")}; ${lemma} is built from its pieces.`;
}

function getArticleCue(article) {
  if (article === "die") return "For this noun, make DIE part of the sound of the word.";
  if (article === "der") return "For this noun, make DER part of the sound of the word.";
  if (article === "das") return "For this noun, make DAS part of the sound of the word.";
  return "Learn the noun as article plus noun, not as a bare word.";
}

function buildGeneralMemoryTrick(word) {
  const lower = word.word_de.toLowerCase();
  const cleanEnglish = word.word_en.replace(/^to\s+/i, "");
  const prefixCues = [
    ["aus", "aus often points outward or completion"],
    ["ein", "ein often points inward"],
    ["ab", "ab often points away/off"],
    ["ver", "ver often changes or pushes the action away"],
    ["be", "be often turns an idea toward a person/object"],
    ["um", "um often means around/change"],
    ["über", "über often means over/across"],
    ["weiter", "weiter means further"],
  ];
  const cue = prefixCues.find(([prefix]) => lower.startsWith(prefix));
  if (cue) return `${cue[1]}; connect ${word.word_de} to "${cleanEnglish}" with that motion.`;
  return `Build one tiny scene for "${cleanEnglish}" and label the action ${word.word_de}.`;
}

function renderDashboard() {
  const total = db.words.length;
  const newCount = db.words.filter((word) => word.status === "new").length;
  const learning = db.words.filter((word) => word.status === "learning").length;
  const mastered = db.words.filter((word) => word.status === "mastered").length;
  const seen = db.words.filter((word) => word.times_seen > 0 || word.status !== "new").length;
  const masteryPercent = total ? Math.round((mastered / total) * 100) : 0;
  const newPercent = total ? (newCount / total) * 100 : 0;
  const learningPercent = total ? (learning / total) * 100 : 0;
  const masteredPercent = total ? (mastered / total) * 100 : 0;

  els.totalWords.textContent = String(total);
  els.learningWords.textContent = String(learning);
  els.masteredWords.textContent = String(mastered);
  els.roundCount.textContent = String(db.sessions.filter((session) => !session.skipped).length);
  els.quickBestScore.textContent = getBestScoreLabel("quick", 5);
  els.fullBestScore.textContent = getBestScoreLabel("full", 20);
  els.retryBestScore.textContent = getBestScoreLabel("retry");
  els.choiceBestScore.textContent = getBestScoreLabel("choice", 10);
  els.streakCount.textContent = String(getCurrentStreak());
  els.storageStatus.textContent = storage.persistent
    ? `Progress is saved locally in this browser. Word bank: ${db.words.length}/${getStarterWordRows().length}.`
    : `Temporary mode: this browser blocked persistent storage. Word bank: ${db.words.length}/${getStarterWordRows().length}. Use CSV export/import for backup.`;
  els.storageStatus.classList.toggle("warning", !storage.persistent);
  els.masteryLabel.textContent = `${masteryPercent}%`;
  els.masteryBar.style.width = `${masteryPercent}%`;
  els.masteryCaption.textContent = `${mastered} mastered · ${learning} learning · ${newCount} waiting`;
  els.dayStreak.textContent = String(getDayStreak());
  els.wordsSeen.textContent = String(seen);
  els.dashboardAccuracy.textContent = `${getOverallAccuracy()}%`;
  els.masteredGoal.textContent = `${mastered} / ${total} mastered`;
  els.newBar.style.width = `${newPercent}%`;
  els.learningBar.style.width = `${learningPercent}%`;
  els.masteredBar.style.width = `${masteredPercent}%`;
  els.statusNewCount.textContent = String(newCount);
  els.statusLearningCount.textContent = String(learning);
  els.statusMasteredCount.textContent = String(mastered);
  renderSessionBars();
  renderStatusWordList();
  renderHardWords();
  renderHomeProgress();
}

function getOverallAccuracy() {
  const sessions = db.sessions.filter((session) => !session.skipped && Number(session.score_total || 0) > 0);
  const totals = sessions.reduce(
    (acc, session) => {
      acc.correct += Number(session.score_correct || 0);
      acc.total += Number(session.score_total || 0);
      return acc;
    },
    { correct: 0, total: 0 }
  );
  return totals.total ? Math.round((totals.correct / totals.total) * 100) : 0;
}

function getDayStreak() {
  const dates = [...new Set(db.sessions.filter((session) => !session.skipped).map((session) => toDateKey(session.date)))].sort().reverse();
  if (!dates.length) return 0;

  const today = new Date();
  const latest = parseDateKey(dates[0]);
  const gapFromToday = dayDiff(latest, startOfDay(today));
  if (gapFromToday > 1) return 0;

  let streak = 1;
  let cursor = latest;
  for (let i = 1; i < dates.length; i += 1) {
    const next = parseDateKey(dates[i]);
    if (dayDiff(next, cursor) === 1) {
      streak += 1;
      cursor = next;
    } else {
      break;
    }
  }
  return streak;
}

function hasCompletedTodayMission() {
  const today = TODAY();
  return db.sessions.some((session) => !session.skipped && getSessionMode(session) === "mission" && toDateKey(session.date) === today);
}

function startMissionRound() {
  if (hasCompletedTodayMission()) {
    els.coachMessage.textContent = "Today's mission is already complete. Nice. Pick another mode if you want extra reps.";
    renderHomeProgress();
    return;
  }
  startRound({ size: 8, mission: true });
}

function renderHomeProgress() {
  renderTodayMission();
  renderWeeklyGoal();
}

function renderTodayMission() {
  const complete = hasCompletedTodayMission();
  els.todayMissionCard.hidden = complete;
  if (complete) return;

  const quotas = getRoundQuotas(8, true);
  els.missionTitle.textContent = `Practice 8 ${getUserLevel()}-smart words`;
  els.missionDetails.textContent = `${quotas.new} new · ${quotas.learning} weak · ${quotas.mastered} review. Finish it once today and this card disappears.`;
}

function getWeekStart(date = new Date()) {
  const start = startOfDay(date);
  const day = start.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset);
  return start;
}

function getWeeklyTouchedWordIds() {
  const weekStart = getWeekStart();
  return new Set(
    db.sessions
      .filter((session) => !session.skipped && parseDateKey(toDateKey(session.date)) >= weekStart)
      .flatMap((session) => session.words_ids || [])
  );
}

function renderWeeklyGoal() {
  const goal = normalizeWeeklyGoal(db.profile?.weeklyGoal);
  const touched = getWeeklyTouchedWordIds().size;
  const percent = goal ? Math.min(100, Math.round((touched / goal) * 100)) : 0;
  const today = startOfDay(new Date());
  const weekEnd = getWeekStart();
  weekEnd.setDate(weekEnd.getDate() + 6);
  const daysLeft = Math.max(0, dayDiff(today, weekEnd));

  els.weeklyGoalTitle.textContent = `${touched} / ${goal} words touched`;
  els.weeklyGoalBar.style.width = `${percent}%`;
  els.weeklyGoalDaysLeft.textContent = daysLeft === 0 ? "Last day" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  els.weeklyGoalCaption.textContent =
    touched >= goal
      ? "Weekly goal complete. That is the kind of boring consistency that wins."
      : `${Math.max(0, goal - touched)} more word${goal - touched === 1 ? "" : "s"} to hit this week's target.`;
}

function toDateKey(value) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(earlier, later) {
  return Math.round((startOfDay(later) - startOfDay(earlier)) / 86400000);
}

function renderSessionBars() {
  const sessions = db.sessions.filter((session) => !session.skipped).slice(-7);
  if (!sessions.length) {
    els.sessionBars.innerHTML = `<p class="mini-status">No rounds yet. Start one and the graph wakes up.</p>`;
    return;
  }

  els.sessionBars.innerHTML = sessions
    .map((session) => {
      const accuracy = Number(session.accuracy || 0);
      const height = Math.max(8, accuracy);
      const quality = accuracy >= 70 ? "good" : accuracy < 50 ? "low" : "";
      return `
        <div class="session-bar ${quality}" title="${accuracy}%">
          <span style="height: ${height}%"></span>
          <small>${accuracy}%</small>
        </div>
      `;
    })
    .join("");
}

function renderDailyPhrase() {
  const phrase = dailyPhrases[Math.floor(Math.random() * dailyPhrases.length)];
  els.phraseGerman.textContent = `"${phrase.de}"`;
  els.phraseMeaning.textContent = phrase.en;
  els.phraseNote.textContent = phrase.note;
}

function startStoryMode(options = {}) {
  const story = pickStoryForLevel(options);
  if (!story) {
    renderStoryReplayPrompt();
    return;
  }

  activeRound = null;
  ensureStoryWords(story);
  activeStory = prepareStory(story);
  storage.set(JSON.stringify(db));
  setQuizMode(true);
  els.quizForm.hidden = true;
  els.choiceQuiz.hidden = true;
  els.storyPanel.hidden = false;
  els.resultsPanel.innerHTML = "";
  els.quizTitle.textContent = "Story Mode";
  els.roundMeta.textContent = `${activeStory.level} · ${activeStory.topic}`;
  els.coachMessage.textContent = "Scan the vocab first, then read the story and prove you understood it.";
  renderStoryIntro();
}

function getEligibleStoriesForLevel() {
  const userIndex = levelIndex(getUserLevel());
  return storyBank.filter((story) => {
    const storyIndex = levelIndex(story.level);
    return storyIndex <= userIndex && storyIndex >= Math.max(0, userIndex - 1);
  });
}

function getCompletedStoryIds() {
  return new Set(
    db.sessions
      .filter((session) => !session.skipped && getSessionMode(session) === "story" && session.story_id)
      .map((session) => session.story_id)
  );
}

function pickStoryForLevel({ allowRepeats = false } = {}) {
  const eligible = getEligibleStoriesForLevel();
  if (!eligible.length) return null;

  const completedStoryIds = getCompletedStoryIds();
  const unplayed = eligible.filter((story) => !completedStoryIds.has(story.id));
  if (unplayed.length) return shuffle(unplayed)[0];
  if (allowRepeats) return shuffle(eligible)[0];
  return null;
}

function renderStoryReplayPrompt() {
  const eligible = getEligibleStoriesForLevel();
  const completedCount = eligible.filter((story) => getCompletedStoryIds().has(story.id)).length;

  activeRound = null;
  activeStory = null;
  setQuizMode(true);
  els.quizForm.hidden = true;
  els.choiceQuiz.hidden = true;
  els.storyPanel.hidden = false;
  els.resultsPanel.innerHTML = "";
  els.quizTitle.textContent = "Story Mode";
  els.roundMeta.textContent = `${getUserLevel()} · ${completedCount}/${eligible.length} complete`;
  els.coachMessage.textContent = "You cleared the fresh stories for this level band.";
  els.storyPanel.innerHTML = `
    <article class="story-card story-replay-card">
      <div class="story-heading">
        <p class="eyebrow">Story shelf complete</p>
        <h3>Repeat the stories?</h3>
        <p>You have already finished every available story for your current level range. Repeating is useful, but the app will keep new stories first whenever they exist.</p>
      </div>
      <div class="story-actions">
        <button class="primary-button" type="button" data-story-action="repeat-all">Repeat stories</button>
        <button class="secondary-button" type="button" data-story-action="home">Back home</button>
      </div>
    </article>
  `;
}

function prepareStory(story) {
  return {
    ...story,
    showTranslations: false,
    answers: Array(story.questions.length).fill(null),
    questions: story.questions.map((question) => {
      const normalized = normalizeStoryQuestion(question);
      const shuffled = shuffle(normalized.options.map((text, index) => ({ text, en: normalized.options_en[index], originalIndex: index })));
      return {
        q: normalized.q,
        q_en: normalized.q_en,
        options: shuffled.map((option) => option.text),
        options_en: shuffled.map((option) => option.en),
        answer: shuffled.findIndex((option) => option.originalIndex === question.answer),
      };
    }),
  };
}

function normalizeStoryQuestion(question) {
  const legacyTranslation = legacyStoryQuestionTranslations[question.q];
  if (legacyTranslation) {
    return {
      q: legacyTranslation.q_de,
      q_en: legacyTranslation.q_en,
      options: legacyTranslation.options_de,
      options_en: legacyTranslation.options_en,
    };
  }
  return {
    q: question.q_de || question.q || "",
    q_en: question.q_en || "",
    options: question.options_de || question.options || [],
    options_en: question.options_en || question.options || [],
  };
}

function renderStoryIntro() {
  if (!activeStory) return;
  els.storyPanel.innerHTML = `
    <article class="story-card">
      <div class="story-heading">
        <p class="eyebrow">${escapeHtml(activeStory.level)} Story</p>
        <h3>${escapeHtml(activeStory.title)}</h3>
        <p>${escapeHtml(activeStory.intro)}</p>
      </div>
      <div class="story-vocab-grid">
        ${activeStory.vocab
          .map(
            ([word_en, word_de]) => `
              <div class="story-vocab-item">
                <strong>${escapeHtml(word_de)}</strong>
                <span>${escapeHtml(word_en)}</span>
              </div>
            `
          )
          .join("")}
      </div>
      <button class="primary-button story-action-button" type="button" data-story-action="read">Read story</button>
    </article>
  `;
}

function renderStoryQuiz() {
  if (!activeStory) return;
  els.storyPanel.innerHTML = `
    <article class="story-card">
      <div class="story-heading">
        <p class="eyebrow">${escapeHtml(activeStory.level)} Story</p>
        <h3>${escapeHtml(activeStory.title)}</h3>
        <button class="secondary-button story-translate-button" type="button" data-story-action="toggle-translation">
          ${activeStory.showTranslations ? "Hide English" : "Show English"}
        </button>
      </div>
      <div class="story-text">
        ${activeStory.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
      <div class="story-questions">
        ${activeStory.questions
          .map(
            (question, questionIndex) => `
              <fieldset class="story-question">
                <legend>
                  ${questionIndex + 1}. ${escapeHtml(question.q)}
                  ${activeStory.showTranslations && question.q_en ? `<span>${escapeHtml(question.q_en)}</span>` : ""}
                </legend>
                <div class="story-options">
                  ${question.options
                    .map(
                      (option, optionIndex) => `
                        <button class="story-option ${activeStory.answers[questionIndex] === optionIndex ? "selected" : ""}" type="button" data-story-question="${questionIndex}" data-story-option="${optionIndex}">
                          ${escapeHtml(option)}
                          ${activeStory.showTranslations && question.options_en[optionIndex] ? `<span>${escapeHtml(question.options_en[optionIndex])}</span>` : ""}
                        </button>
                      `
                    )
                    .join("")}
                </div>
              </fieldset>
            `
          )
          .join("")}
      </div>
      <div class="story-actions">
        <button class="secondary-button" type="button" data-story-action="intro">Back to vocab</button>
        <button class="primary-button" type="button" data-story-action="submit">Check story</button>
      </div>
    </article>
  `;
}

function handleStoryPanelClick(event) {
  const actionButton = event.target.closest("[data-story-action]");
  if (actionButton) {
    const action = actionButton.dataset.storyAction;
    if (action === "read") renderStoryQuiz();
    if (action === "intro") renderStoryIntro();
    if (action === "repeat-all") startStoryMode({ allowRepeats: true });
    if (action === "home") exitRound();
    if (action === "toggle-translation" && activeStory) {
      activeStory.showTranslations = !activeStory.showTranslations;
      renderStoryQuiz();
    }
    if (action === "submit") finishStoryMode();
    return;
  }

  const optionButton = event.target.closest("[data-story-question]");
  if (!optionButton || !activeStory) return;
  const questionIndex = Number(optionButton.dataset.storyQuestion);
  const optionIndex = Number(optionButton.dataset.storyOption);
  activeStory.answers[questionIndex] = optionIndex;
  renderStoryQuiz();
}

function finishStoryMode() {
  if (!activeStory) return;
  const unanswered = activeStory.answers.some((answer) => answer === null);
  if (unanswered) {
    els.coachMessage.textContent = "Answer every story question first. No mystery blanks today.";
    return;
  }

  const score = activeStory.questions.filter((question, index) => activeStory.answers[index] === question.answer).length;
  const total = activeStory.questions.length;
  const accuracy = Math.round((score / total) * 100);
  const storyWords = getStoryWordRecords(activeStory);
  applyStoryExposure(storyWords, accuracy);
  db.sessions.push({
    round_id: `story-${Date.now()}`,
    date: new Date().toISOString(),
    score_correct: score,
    score_total: total,
    accuracy,
    words_ids: storyWords.map((word) => word.id),
    count_new: 0,
    count_learning: storyWords.length,
    count_mastered_review: 0,
    retry_only: false,
    mode: "story",
    level: getUserLevel(),
    story_id: activeStory.id,
  });

  renderStoryResults(score, total);
  activeStory = null;
  els.storyPanel.hidden = true;
  setResultsMode();
  saveDb();
}

function getStoryWordRecords(story) {
  const wordsByKey = new Map(db.words.map((word) => [normalizeAnswer(`${word.word_en}|${word.word_de}`), word]));
  const wordsByGerman = new Map(db.words.map((word) => [normalizeAnswer(word.word_de), word]));
  return story.vocab
    .map((entry) => {
      const { word_en, word_de } = normalizeStoryVocabEntry(entry, story);
      return wordsByKey.get(normalizeAnswer(`${word_en}|${word_de}`)) || wordsByGerman.get(normalizeAnswer(word_de));
    })
    .filter(Boolean);
}

function ensureStoryWords(story) {
  const wordsByKey = new Map(db.words.map((word) => [normalizeAnswer(`${word.word_en}|${word.word_de}`), word]));
  const wordsByGerman = new Map(db.words.map((word) => [normalizeAnswer(word.word_de), word]));
  const now = new Date().toISOString();

  story.vocab.forEach((entry) => {
    const record = normalizeStoryVocabEntry(entry, story);
    const key = normalizeAnswer(`${record.word_en}|${record.word_de}`);
    if (wordsByKey.has(key) || wordsByGerman.has(normalizeAnswer(record.word_de))) return;
    const word = normalizeWordRecord({
      id: makeId(),
      word_en: record.word_en,
      word_de: record.word_de,
      part_of_speech: record.part_of_speech || guessPartOfSpeech(record.word_en, record.word_de),
      topic: record.topic || story.topic || guessTopic(record.word_en, record.word_de),
      difficulty: record.difficulty || story.level || guessDifficulty(record.word_en, record.word_de),
      notes: record.notes || `From Story Mode: ${story.title}`,
      status: "new",
      created_at: now,
    });
    db.words.push(word);
    wordsByKey.set(key, word);
    wordsByGerman.set(normalizeAnswer(word.word_de), word);
  });
}

function normalizeStoryVocabEntry(entry, story) {
  const [word_en, word_de, part_of_speech = "", topic = story.topic || "", difficulty = story.level || "", notes = ""] = entry;
  return { word_en, word_de, part_of_speech, topic, difficulty, notes };
}

function applyStoryExposure(words, accuracy) {
  const result = accuracy >= 70 ? "correct" : accuracy >= 50 ? "half" : "wrong";
  const today = TODAY();
  words.forEach((word) => {
    word.times_seen += 1;
    word.last_seen = today;
    word.last_result = result;
    if (word.status === "new") word.status = "learning";
  });
}

function renderStoryResults(score, total) {
  const story = activeStory;
  const accuracy = Math.round((score / total) * 100);
  els.coachMessage.textContent =
    accuracy >= 80
      ? "Story understood. That vocab has context now."
      : accuracy >= 60
        ? "You got the story shape. A few details need another look."
        : "Story was slippery. Good news: now we know where to practice.";
  els.resultsPanel.innerHTML = `
    <div class="result-summary">
      <article><small>Story</small><strong>${score}/${total}</strong></article>
      <article><small>Accuracy</small><strong>${accuracy}%</strong></article>
      <article><small>Level</small><strong>${escapeHtml(story.level)}</strong></article>
      <article><small>Vocab touched</small><strong>${getStoryWordRecords(story).length}</strong></article>
    </div>
    <section class="result-group">
      <h3>${escapeHtml(story.title)}</h3>
      <ol class="result-list">
        ${story.questions
          .map((question, index) => {
            const chosen = story.answers[index];
            const correct = chosen === question.answer;
            const chosenText = chosen === null || chosen === undefined ? "blank" : question.options[chosen];
            return `<li class="${correct ? "correct" : "wrong"}">${index + 1}. ${escapeHtml(question.q)}${question.q_en ? ` <span class="half">(${escapeHtml(question.q_en)})</span>` : ""}<br><strong>${escapeHtml(question.options[question.answer])}</strong>${correct ? " ✓" : ` · you chose ${escapeHtml(chosenText)}`}</li>`;
          })
          .join("")}
      </ol>
    </section>
  `;
}

function setStatusFilter(status) {
  activeStatusFilter = status;
  lastStatusMoveMessage = "";
  renderStatusWordList();
}

function renderStatusWordList() {
  const counts = {
    learning: db.words.filter((word) => word.status === "learning").length,
    mastered: db.words.filter((word) => word.status === "mastered").length,
    new: db.words.filter((word) => word.status === "new").length,
  };
  const buttons = [
    ["learning", els.statusLearningBtn],
    ["mastered", els.statusMasteredBtn],
    ["new", els.statusNewBtn],
  ];

  els.learningListCount.textContent = String(counts.learning);
  els.masteredListCount.textContent = String(counts.mastered);
  els.newListCount.textContent = String(counts.new);

  buttons.forEach(([status, button]) => {
    const active = activeStatusFilter === status;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  const words = sortStatusWords(db.words.filter((word) => word.status === activeStatusFilter), activeStatusFilter);
  const meta = getStatusMeta(activeStatusFilter);
  els.wordManagerSummary.textContent =
    lastStatusMoveMessage
      ? lastStatusMoveMessage
      : `${counts[activeStatusFilter]} ${meta.label.toLowerCase()} word${counts[activeStatusFilter] === 1 ? "" : "s"}`;

  if (!words.length) {
    els.statusWordList.innerHTML = `<p class="mini-status">${meta.empty}</p>`;
    return;
  }

  els.statusWordList.innerHTML = words
    .map((word) => {
      const lastResult = word.last_result ? ` · last: ${word.last_result}` : "";
      const notes = word.notes ? `<small>${escapeHtml(word.notes)}</small>` : "";
      return `
        <article class="status-word-row">
          <div>
            <strong>${escapeHtml(toPrompt(word.word_en))} → ${escapeHtml(word.word_de)}</strong>
            <span>${escapeHtml(word.topic)} · ${escapeHtml(word.difficulty)} · streak ${word.correct_streak} · seen ${word.times_seen}${lastResult}</span>
            ${notes}
          </div>
          <button class="${meta.buttonClass}" type="button" data-word-action="status" data-word-id="${escapeHtml(word.id)}" data-target-status="${meta.target}">
            ${meta.action}
          </button>
        </article>
      `;
    })
    .join("");
}

function sortStatusWords(words, status) {
  const sorted = [...words];
  if (status === "learning") {
    return sorted.sort(
      (a, b) =>
        Number(b.wrong_count || 0) - Number(a.wrong_count || 0) ||
        Number(a.correct_streak || 0) - Number(b.correct_streak || 0) ||
        Number(b.times_seen || 0) - Number(a.times_seen || 0) ||
        a.word_en.localeCompare(b.word_en)
    );
  }
  if (status === "mastered") {
    return sorted.sort(
      (a, b) =>
        (b.last_seen || "").localeCompare(a.last_seen || "") ||
        Number(b.correct_streak || 0) - Number(a.correct_streak || 0) ||
        a.word_en.localeCompare(b.word_en)
    );
  }
  return sorted.sort(
    (a, b) =>
      TOPIC_PRIORITY.indexOf(a.topic) - TOPIC_PRIORITY.indexOf(b.topic) ||
      a.difficulty.localeCompare(b.difficulty) ||
      a.word_en.localeCompare(b.word_en)
  );
}

function getStatusMeta(status) {
  if (status === "mastered") {
    return {
      label: "Mastered",
      action: "Move to learning",
      target: "learning",
      buttonClass: "secondary-button status-move-button",
      empty: "No mastered words yet. They graduate after a solid streak.",
    };
  }
  if (status === "new") {
    return {
      label: "New",
      action: "Start learning",
      target: "learning",
      buttonClass: "secondary-button status-move-button",
      empty: "No new words waiting. The bank is fully in play.",
    };
  }
  return {
    label: "Learning",
    action: "Mark mastered",
    target: "mastered",
    buttonClass: "primary-button status-move-button",
    empty: "No learning words right now. Start a round and some words will enter the arena.",
  };
}

function handleStatusWordAction(event) {
  const button = event.target.closest("[data-word-action='status']");
  if (!button) return;
  event.stopPropagation();

  const word = db.words.find((item) => item.id === button.dataset.wordId);
  if (!word) return;

  const targetStatus = button.dataset.targetStatus;
  const oldStatus = word.status;
  moveWordToStatus(word, targetStatus);
  lastStatusMoveMessage = `${word.word_de} moved from ${oldStatus} to ${targetStatus}.`;
  els.coachMessage.textContent = `${word.word_de} moved from ${oldStatus} to ${targetStatus}.`;
  saveDb();
}

function moveWordToStatus(word, targetStatus) {
  if (targetStatus === "mastered") {
    word.status = "mastered";
    word.correct_streak = Math.max(3, Number(word.correct_streak || 0));
    return;
  }
  if (targetStatus === "learning") {
    word.status = "learning";
    word.correct_streak = 0;
  }
}

function renderHardWords() {
  const wordsById = new Map(db.words.map((word) => [word.id, word]));
  const latestSession = [...db.sessions].reverse().find((session) => !session.skipped);
  const latestMissedIds = latestSession?.missed_word_ids || [];
  const freshMisses = latestMissedIds.map((id) => wordsById.get(id)).filter(Boolean);
  const freshMissIds = new Set(freshMisses.map((word) => word.id));
  const trickyWords = [...db.words]
    .filter((word) => !freshMissIds.has(word.id))
    .filter((word) => Number(word.wrong_count || 0) > 0 || Number(word.half_count || 0) > 0 || ["wrong", "half"].includes(word.last_result))
    .sort((a, b) => hardScore(b) - hardScore(a))
    .slice(0, 12);

  if (!freshMisses.length && !trickyWords.length) {
    els.hardWordsList.innerHTML = `<p class="mini-status">Nothing to recap yet. Miss a word in a round and it will show up here.</p>`;
    return;
  }

  const freshSection = freshMisses.length
    ? `
      <section class="recap-section">
        <h3>Fresh from last round</h3>
        ${freshMisses.map((word) => renderRecapWord(word, true)).join("")}
      </section>
    `
    : latestSession
      ? `<p class="mini-status">Last round was clean. Older tricky words are below.</p>`
      : "";
  const trickySection = trickyWords.length
    ? `
      <section class="recap-section">
        <h3>Still tricky</h3>
        ${trickyWords.map((word) => renderRecapWord(word)).join("")}
      </section>
    `
    : "";

  els.hardWordsList.innerHTML = `${freshSection}${trickySection}`;
}

function renderRecapWord(word, isFresh = false) {
  const label = word.last_result === "wrong" ? "missed" : word.last_result === "half" ? "half" : "review";
  const when = word.last_missed_at ? ` · ${formatRecapTime(word.last_missed_at)}` : "";
  return `
    <div class="hard-item ${isFresh ? "fresh-miss" : ""}">
      <strong>${escapeHtml(toPrompt(word.word_en))} → ${escapeHtml(word.word_de)}</strong>
      <small>${escapeHtml(label)}${when} · missed ${word.wrong_count || 0}x · half ${word.half_count || 0}x · streak ${word.correct_streak || 0}</small>
    </div>
  `;
}

function formatRecapTime(value) {
  const missedAt = new Date(value);
  if (Number.isNaN(missedAt.getTime())) return "recent";
  const ageMinutes = Math.max(0, Math.round((Date.now() - missedAt.getTime()) / 60000));
  if (ageMinutes < 2) return "just now";
  if (ageMinutes < 60) return `${ageMinutes} min ago`;
  const ageHours = Math.round(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  const ageDays = Math.round(ageHours / 24);
  return `${ageDays}d ago`;
}

function hardScore(word) {
  const lastMissedAt = word.last_missed_at ? new Date(word.last_missed_at).getTime() : 0;
  const ageHours = lastMissedAt ? Math.max(0, (Date.now() - lastMissedAt) / 3600000) : Infinity;
  const recencyBoost = ageHours < 1 ? 50 : ageHours < 24 ? 36 : ageHours < 72 ? 24 : ageHours < 168 ? 14 : 4;
  const resultBoost = word.last_result === "wrong" ? 28 : word.last_result === "half" ? 18 : 0;
  const statusBoost = word.status === "learning" ? 6 : word.status === "mastered" ? -8 : 0;
  return (
    Number(word.wrong_count || 0) * 6 +
    Number(word.half_count || 0) * 3 +
    Number(word.times_seen || 0) +
    recencyBoost +
    resultBoost +
    statusBoost -
    Number(word.correct_streak || 0) * 2
  );
}

function addWordsFromText() {
  const raw = els.addWordsText.value.trim();
  if (!raw) {
    els.addWordsStatus.textContent = "Paste words first. Format: English - German, one per line.";
    return;
  }

  const parsed = parseBulkWords(raw);

  if (!parsed.length) {
    els.addWordsStatus.textContent = "I couldn't parse that. Use: to negotiate - verhandeln, or paste CSV with word_en and word_de.";
    return;
  }

  const existingKeys = new Set(db.words.map((word) => normalizeAnswer(`${word.word_en}|${word.word_de}`)));
  const now = new Date().toISOString();
  let added = 0;

  parsed.forEach((record) => {
    const word_en = record.word_en.trim();
    const word_de = record.word_de.trim();
    const key = normalizeAnswer(`${word_en}|${word_de}`);
    if (existingKeys.has(key)) return;
    db.words.push(
      normalizeWordRecord({
        id: record.id || makeId(),
        word_en,
        word_de,
        part_of_speech: record.part_of_speech || guessPartOfSpeech(word_en, word_de),
        topic: record.topic || guessTopic(word_en, word_de),
        difficulty: record.difficulty || guessDifficulty(word_en, word_de),
        notes: record.notes || "",
        status: "new",
        created_at: now,
      })
    );
    existingKeys.add(key);
    added += 1;
  });

  els.addWordsText.value = "";
  els.addWordsStatus.textContent = `${added} word${added === 1 ? "" : "s"} added. Fresh targets acquired.`;
  saveDb();
}

function parseBulkWords(raw) {
  const rows = parseCsv(raw);
  const firstRow = rows[0]?.map((cell) => cell.trim().toLowerCase()) || [];

  if (firstRow.includes("word_en") && firstRow.includes("word_de")) {
    return rows
      .slice(1)
      .map((row) => Object.fromEntries(firstRow.map((header, index) => [header, row[index] || ""])))
      .filter((record) => record.word_en && record.word_de);
  }

  return raw
    .split(/;\s*|\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(parseWordPair)
    .filter(Boolean);
}

function parseWordPair(chunk) {
  const match = chunk.match(/^(.+?)\s+(?:-|–|—|=|:)\s+(.+)$/) || chunk.match(/^(.+?),\s*(.+)$/);
  if (!match) return null;
  return {
    word_en: match[1].trim(),
    word_de: match[2].trim(),
  };
}

function guessPartOfSpeech(en, de) {
  const lowerEn = en.toLowerCase();
  const lowerDe = de.toLowerCase();
  if (/^(der|die|das)\s+/.test(lowerDe)) return "noun";
  if (lowerEn.startsWith("to ") || lowerDe.includes("sich ") || lowerDe.endsWith("en")) return "verb";
  if (lowerEn.includes(" ") || lowerDe.includes(" ")) return "phrase";
  return "adjective";
}

function guessTopic(en, de) {
  const text = `${en} ${de}`.toLowerCase();
  if (/job|work|salary|meeting|contract|bewerbung|gehalt|arbeit|frist|stelle/.test(text)) return "arbeit";
  if (/train|bus|ticket|station|platform|zug|bahn|bus|verkehr|bike/.test(text)) return "transport";
  if (/doctor|health|pain|pharmacy|arzt|krank|schmerz|apotheke|fieber/.test(text)) return "gesundheit";
  if (/rent|apartment|laundry|vacuum|müll|wohnung|miete|wäsche|heizung/.test(text)) return "haushalt";
  if (/office|permit|form|document|behörde|amt|formular|nachweis|titel/.test(text)) return "behörden";
  if (/feel|mood|fear|worried|relieved|angst|stimmung|peinlich|besorgt/.test(text)) return "gefühle";
  if (/club|hike|free|invite|ausstellung|verein|freizeit|wanderung/.test(text)) return "freizeit";
  return "alltag";
}

function guessDifficulty(en, de) {
  const text = `${en} ${de}`.toLowerCase();
  if (/posting|permit|insurance|requirement|submit|authority|ausschreibung|aufenthalt|voraussetzung|einreichen|versicherung/.test(text)) return "B2";
  if (/apple|bread|water|coffee|milk|cheese|egg|money|house|street|city|day|week|eat|drink|buy|apfel|brot|wasser|kaffee|milch|käse|ei|geld|haus|straße|stadt/.test(text)) return "A1";
  if (/apple|bread|water|train station|müll|bahnhof|apotheke|fieber/.test(text)) return "A2";
  return "B1";
}

function exportCsv() {
  const rows = [
    ["id", "word_en", "word_de", "part_of_speech", "topic", "status", "correct_streak", "times_seen", "wrong_count", "half_count", "last_seen", "last_result", "difficulty", "notes"],
    ...db.words.map((word) => [
      word.id,
      word.word_en,
      word.word_de,
      word.part_of_speech,
      word.topic,
      word.status,
      word.correct_streak,
      word.times_seen,
      word.wrong_count,
      word.half_count,
      word.last_seen,
      word.last_result,
      word.difficulty,
      word.notes,
    ]),
  ];
  downloadText(`german-vocab-${TODAY()}.csv`, rows.map(toCsvRow).join("\n"));
}

function showSampleCsv() {
  const sample = [
    ["word_en", "word_de", "part_of_speech", "topic", "difficulty", "notes"],
    ["job posting", "die Stellenausschreibung", "noun", "arbeit", "B2", ""],
    ["to negotiate", "verhandeln", "verb", "arbeit", "B2", ""],
  ];
  downloadText("german-vocab-import-template.csv", sample.map(toCsvRow).join("\n"));
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCsvRow(row) {
  return row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",");
}

async function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) return;

  const headers = rows[0].map((header) => header.trim());
  const existing = new Map(db.words.map((word) => [normalizeAnswer(`${word.word_en}|${word.word_de}`), word]));
  let imported = 0;

  rows.slice(1).forEach((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
    if (!record.word_en || !record.word_de) return;
    const key = normalizeAnswer(`${record.word_en}|${record.word_de}`);
    if (existing.has(key)) {
      Object.assign(existing.get(key), normalizeWordRecord({ ...existing.get(key), ...record }));
      return;
    }
    const word = normalizeWordRecord({
      ...record,
      id: record.id || makeId(),
      status: record.status || "new",
      part_of_speech: record.part_of_speech || guessPartOfSpeech(record.word_en, record.word_de),
      topic: record.topic || guessTopic(record.word_en, record.word_de),
      difficulty: record.difficulty || guessDifficulty(record.word_en, record.word_de),
    });
    db.words.push(word);
    existing.set(key, word);
    imported += 1;
  });

  event.target.value = "";
  els.coachMessage.textContent = `${imported} new word${imported === 1 ? "" : "s"} imported. The word bank just got heavier.`;
  saveDb();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function resetDb() {
  const confirmed = window.confirm("Reset all local vocab progress and restore the starter database?");
  if (!confirmed) return;
  const profile = normalizeProfile(db.profile);
  db = createSeedDb();
  db.profile = profile;
  saveDb();
  activeRound = null;
  activeStory = null;
  els.quizForm.hidden = true;
  els.choiceQuiz.hidden = true;
  els.storyPanel.hidden = true;
  els.resultsPanel.innerHTML = "";
  els.quizTitle.textContent = "Start a 20-word round";
  els.roundMeta.textContent = "Ready when you are";
  els.coachMessage.textContent = "Fresh database restored. Clean slate, sharp pencil.";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

els.quickRoundBtn.addEventListener("click", () => startRound({ size: 5 }));
els.fullRoundBtn.addEventListener("click", () => startRound({ size: 20 }));
els.retryBtn.addEventListener("click", () => startRound({ retryOnly: true, size: 20 }));
els.multipleChoiceBtn.addEventListener("click", () => startRound({ mode: "choice", size: 10 }));
els.storyModeBtn.addEventListener("click", startStoryMode);
els.startMissionBtn.addEventListener("click", startMissionRound);
els.dontKnowChoiceBtn.addEventListener("click", () => handleChoiceAnswer(null, els.dontKnowChoiceBtn));
els.exitRoundBtn.addEventListener("click", exitRound);
els.refreshPhraseBtn.addEventListener("click", renderDailyPhrase);
els.profilePromptForm.addEventListener("submit", handleProfilePromptSubmit);
els.profileNameForm.addEventListener("submit", handleProfileNameSubmit);
els.levelButtons.addEventListener("click", handleLevelClick);
els.weeklyGoalForm.addEventListener("submit", handleWeeklyGoalSubmit);
els.dashboardToggleBtn.addEventListener("click", toggleDashboard);
els.recapToggleBtn.addEventListener("click", toggleRecap);
els.closeDashboardBtn.addEventListener("click", closeUtilityPanels);
els.closeRecapBtn.addEventListener("click", closeUtilityPanels);
els.statusLearningBtn.addEventListener("click", () => setStatusFilter("learning"));
els.statusMasteredBtn.addEventListener("click", () => setStatusFilter("mastered"));
els.statusNewBtn.addEventListener("click", () => setStatusFilter("new"));
els.statusWordList.addEventListener("click", handleStatusWordAction);
els.dashboardPanel.addEventListener("click", (event) => event.stopPropagation());
els.recapPanel.addEventListener("click", (event) => event.stopPropagation());
els.storyPanel.addEventListener("click", handleStoryPanelClick);
els.quizForm.addEventListener("submit", submitAnswers);
els.addWordsBtn.addEventListener("click", addWordsFromText);
els.exportCsvBtn.addEventListener("click", exportCsv);
els.importCsvInput.addEventListener("change", importCsv);
els.sampleCsvBtn.addEventListener("click", showSampleCsv);
els.resetBtn.addEventListener("click", resetDb);
document.addEventListener("click", handleOutsidePanelClick);
document.addEventListener("keydown", handleEscapeKey);

renderDailyPhrase();
renderDashboard();
renderProfile();
if (shouldAskForProfileName()) openProfilePrompt();

if ("serviceWorker" in window.navigator) {
  window.addEventListener("load", () => {
    window.navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still works without offline caching, so registration failures stay quiet.
    });
  });
}
