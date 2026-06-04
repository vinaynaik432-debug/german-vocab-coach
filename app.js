const STORAGE_KEY = "vinay_german_vocab_coach_v1";
const ROUND_SIZE = 20;
const STARTER_BANK_VERSION = 3;
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

let db = loadDb();
let activeRound = null;
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
  exitRoundBtn: document.querySelector("#exitRoundBtn"),
  refreshPhraseBtn: document.querySelector("#refreshPhraseBtn"),
  phraseGerman: document.querySelector("#phraseGerman"),
  phraseMeaning: document.querySelector("#phraseMeaning"),
  phraseNote: document.querySelector("#phraseNote"),
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
      difficulty: row[4],
      notes: row[5],
      created_at: now,
    })),
    sessions: [],
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
    parsed.words = (parsed.words || []).map(normalizeWordRecord);
    parsed.sessions = parsed.sessions || [];
    const addedStarterWords = mergeStarterWords(parsed);
    const shouldPersistUpgrade = addedStarterWords || Number(parsed.version || 0) < STARTER_BANK_VERSION;
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
    difficulty: ["A2", "B1", "B2"].includes(word.difficulty) ? word.difficulty : "B1",
    notes: word.notes || "",
    created_at: word.created_at || new Date().toISOString(),
  };
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

function getRoundMode({ mode, retryOnly, roundSize }) {
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

function pickRound({ retryOnly = false, size = ROUND_SIZE } = {}) {
  const targetSize = Math.max(1, Math.min(size, db.words.length || size));
  const selected = [];
  const selectedIds = new Set();
  const recentTwo = getRecentWordIds(2);
  const recentFive = getRecentWordIds(5);
  const quotas = getRoundQuotas(targetSize);

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
    .sort((a, b) => difficultyScore(b, recentTwo) - difficultyScore(a, recentTwo));

  if (retryOnly) {
    addFrom(learning, targetSize);
    return selected.slice(0, targetSize);
  }

  const newWords = db.words
    .filter((word) => word.status === "new")
    .map((word) => ({ ...word, bucket: "new" }))
    .sort((a, b) => newWordScore(b, recentTwo) - newWordScore(a, recentTwo));

  const mastered = db.words
    .filter((word) => word.status === "mastered" && !recentFive.has(word.id))
    .map((word) => ({ ...word, bucket: "mastered" }))
    .sort((a, b) => (a.last_seen || "").localeCompare(b.last_seen || ""));

  addFrom(learning, quotas.learning);
  addFrom(newWords, quotas.new);
  addFrom(mastered, quotas.mastered);

  const fillers = [...learning, ...newWords, ...mastered, ...db.words.map((word) => ({ ...word, bucket: word.status }))]
    .filter((word) => !recentTwo.has(word.id) || db.words.length < targetSize * 2)
    .sort((a, b) => fillScore(b) - fillScore(a));

  addFrom(fillers, targetSize);
  return shuffle(selected).slice(0, targetSize);
}

function getRoundQuotas(size) {
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
  return (topicBoosts[word.topic] || 4) + difficultyBoost - (recentSet.has(word.id) ? 6 : 0);
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
  });

  setQuizMode(true);
  els.resultsPanel.innerHTML = "";
  els.quizForm.hidden = activeRound.mode !== "typed";
  els.choiceQuiz.hidden = activeRound.mode !== "choice";
  els.promptList.innerHTML = "";
  els.choiceOptions.innerHTML = "";
  els.quizTitle.textContent =
    activeRound.mode === "choice"
      ? "Multiple choice"
      : options.retryOnly
        ? "Retry round: hard words only"
        : `Translate these ${activeRound.roundSize} words`;
  els.roundMeta.textContent = `Round ${activeRound.roundNumber} · Score to beat: ${getBestScoreLabel(activeRound.sessionMode, activeRound.roundSize)}`;
  els.coachMessage.textContent =
    activeRound.mode === "choice"
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
  closeUtilityPanels();
}

function setHomeMode() {
  els.appShell.classList.remove("quiz-active", "results-active");
  els.startScreen.hidden = false;
  els.welcomeCard.hidden = false;
  els.roundMenu.hidden = false;
  els.quizHeader.hidden = true;
}

function exitRound() {
  activeRound = null;
  els.quizForm.hidden = true;
  els.choiceQuiz.hidden = true;
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
      if (word.status === "new") word.status = "learning";
    } else {
      word.correct_streak = 0;
      word.wrong_count += 1;
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
    retry_only: activeRound.retryOnly,
    mode: activeRound.sessionMode,
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
  const hard = [...db.words]
    .filter((word) => Number(word.wrong_count || 0) > 0 || Number(word.half_count || 0) > 0)
    .sort((a, b) => hardScore(b) - hardScore(a))
    .slice(0, 10);

  if (!hard.length) {
    els.hardWordsList.innerHTML = `<p class="mini-status">Nothing to recap yet. Miss a word in a round and it will show up here.</p>`;
    return;
  }

  els.hardWordsList.innerHTML = hard
    .map(
      (word) => `
        <div class="hard-item">
          <strong>${escapeHtml(toPrompt(word.word_en))} → ${escapeHtml(word.word_de)}</strong>
          <small>Missed ${word.wrong_count || 0}x · half ${word.half_count || 0}x · streak ${word.correct_streak || 0}</small>
        </div>
      `
    )
    .join("");
}

function hardScore(word) {
  return Number(word.wrong_count || 0) * 5 + Number(word.half_count || 0) * 2 + Number(word.times_seen || 0) - Number(word.correct_streak || 0) * 2;
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
  downloadText(`vinay-german-vocab-${TODAY()}.csv`, rows.map(toCsvRow).join("\n"));
}

function showSampleCsv() {
  const sample = [
    ["word_en", "word_de", "part_of_speech", "topic", "difficulty", "notes"],
    ["job posting", "die Stellenausschreibung", "noun", "arbeit", "B2", ""],
    ["to negotiate", "verhandeln", "verb", "arbeit", "B2", ""],
  ];
  downloadText("vinay-vocab-import-template.csv", sample.map(toCsvRow).join("\n"));
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
  db = createSeedDb();
  saveDb();
  activeRound = null;
  els.quizForm.hidden = true;
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
els.dontKnowChoiceBtn.addEventListener("click", () => handleChoiceAnswer(null, els.dontKnowChoiceBtn));
els.exitRoundBtn.addEventListener("click", exitRound);
els.refreshPhraseBtn.addEventListener("click", renderDailyPhrase);
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

if ("serviceWorker" in window.navigator) {
  window.addEventListener("load", () => {
    window.navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still works without offline caching, so registration failures stay quiet.
    });
  });
}
