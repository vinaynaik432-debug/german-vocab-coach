/* Original fictional workplace practice. B1/B2 are editorial difficulty guides, not certified levels.
   Model answers are examples, not the only valid responses. Speaking checklists are self-review, not grading. */
const MarketingScenarios = [
  {
    id: 'marketing-crm-handover',
    title: 'Einen Lead an den Vertrieb übergeben',
    category: 'crm', level: 'B1',
    reading: 'Ein neuer Lead hat eine Produktdemo angefragt. Im CRM-System fehlen noch die Unternehmensgröße und der gewünschte Termin. Ich ergänze die Angaben und notiere, welche Fragen im Gespräch offen geblieben sind. Danach übergebe ich den Lead an den Vertrieb. Eine Kollegin übernimmt den nächsten Kontakt.',
    translation: 'A new lead has requested a product demo. The CRM system is still missing the company size and the preferred date. I add the details and note which questions were left open in the conversation. Then I hand the lead over to sales. A colleague takes responsibility for the next contact.',
    phrases: [
      { de: 'der Lead; die Leads', en: 'lead; leads' },
      { de: 'der Kontakt; die Kontakte', en: 'contact; contacts' },
      { de: 'die Angabe; die Angaben', en: 'detail; details' },
      { de: 'fehlende Angaben ergänzen', en: 'to add missing details' },
      { de: 'einen Lead an den Vertrieb übergeben', en: 'to hand a lead over to sales' },
      { de: 'Wer übernimmt den nächsten Kontakt?', en: 'Who will handle the next contact?' }
    ],
    writePrompt: 'Write a short German handover note: the lead wants a demo, the preferred date is still missing, and sales should arrange it. Two sentences are enough.',
    modelAnswer: 'Der Lead möchte eine Produktdemo, aber der gewünschte Termin fehlt noch. Könnt ihr den nächsten Kontakt übernehmen und einen Termin vereinbaren?',
    speakPrompt: 'Explain the handover in German to a sales colleague. Say what you know, what is missing and who should do the next step.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I distinguish known information from a missing detail?',
      'Did I make the next action and its owner clear?',
      'Could I use „den Lead übergeben“ or „einen Termin vereinbaren“ without reading the model?'
    ],
    variation: 'Now the demo date is confirmed, but the lead asks a technical question you cannot answer. Give a new handover that names this open question and asks sales to involve the right colleague.',
    curriculumWordIds: ['marketing-crm-01', 'marketing-crm-03', 'marketing-crm-05', 'marketing-crm-20', 'marketing-strategy-09']
  },
  {
    id: 'marketing-crm-segmentation',
    title: 'Einen CRM-Workflow prüfen',
    category: 'crm', level: 'B1',
    reading: 'Wir planen eine E-Mail für Bestandskunden. Vor dem Versand prüfen wir die Datenqualität und segmentieren die Kontakte nach ihrem letzten Kauf. Im Test-Workflow wird ein Kontakt zweimal aufgenommen. Wir halten den Versand an, entfernen die Dublette und testen den Ablauf erneut. Erst danach bitten wir um die Freigabe.',
    translation: 'We are planning an email for existing customers. Before sending it, we check data quality and segment contacts by their last purchase. In the test workflow, one contact is included twice. We pause the send, remove the duplicate and test the workflow again. Only then do we ask for approval.',
    phrases: [
      { de: 'der Bestandskunde; die Bestandskunden', en: 'existing customer; existing customers' },
      { de: 'der Workflow; die Workflows', en: 'workflow; workflows' },
      { de: 'die Dublette; die Dubletten', en: 'duplicate record; duplicate records' },
      { de: 'Kontakte nach ihrem letzten Kauf segmentieren', en: 'to segment contacts by their last purchase' },
      { de: 'die Datenqualität prüfen', en: 'to check data quality' },
      { de: 'den Ablauf erneut testen', en: 'to test the workflow again' }
    ],
    writePrompt: 'Write a German update explaining why the email has not been sent yet and what must happen before approval.',
    modelAnswer: 'Der Versand ist angehalten, weil ein Kontakt im Test zweimal aufgenommen wurde. Wir entfernen die Dublette und testen den Workflow erneut, bevor wir um die Freigabe bitten.',
    speakPrompt: 'Tell a colleague in German why you paused the workflow. Explain the issue and your next check without blaming anyone.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I name the actual problem instead of saying only „Es funktioniert nicht“?',
      'Did I explain a sensible next check before sending?',
      'If I used „weil“ or „bevor“, did I place the conjugated verb at the end of that clause?'
    ],
    variation: 'The duplicate has been fixed, but the test email contains the wrong first name. Give a new update that keeps the send paused and names the field you will check.',
    curriculumWordIds: ['marketing-crm-06', 'marketing-crm-07', 'marketing-crm-09', 'marketing-crm-15', 'marketing-crm-19', 'marketing-meetings-03']
  },
  {
    id: 'marketing-metrics-conversion',
    title: 'Eine Conversion-Rate erklären',
    category: 'metrics', level: 'B1',
    reading: 'In diesem fiktiven Wochenbericht zählen wir 500 Besuche auf einer Landingpage und 25 abgeschickte Kontaktformulare. Als Conversion gilt hier ein abgeschicktes Formular. Die Conversion-Rate beträgt also 25 geteilt durch 500, mal 100: 5 Prozent. Wir nennen den Zeitraum und die Bezugsgröße im Bericht, damit das Team die Zahl richtig einordnen kann.',
    translation: 'In this fictional weekly report, we count 500 visits to a landing page and 25 submitted contact forms. Here, a conversion means a submitted form. The conversion rate is therefore 25 divided by 500, multiplied by 100: 5 percent. We state the period and denominator in the report so the team can interpret the number correctly.',
    phrases: [
      { de: 'die Kennzahl; die Kennzahlen', en: 'metric; metrics' },
      { de: 'der KPI; die KPIs', en: 'key performance indicator; key performance indicators' },
      { de: 'die Conversion-Rate; die Conversion-Raten', en: 'conversion rate; conversion rates' },
      { de: 'der Bericht; die Berichte', en: 'report; reports' },
      { de: 'Die Conversion-Rate beträgt fünf Prozent.', en: 'The conversion rate is five percent.' },
      { de: 'Als Conversion gilt hier ein abgeschicktes Formular.', en: 'Here, a conversion means a submitted form.' },
      { de: 'Auf welchen Zeitraum bezieht sich die Zahl?', en: 'Which period does the number refer to?' }
    ],
    writePrompt: 'Explain the fictional result in two German sentences. Include the 25 forms, 500 visits, the resulting rate and what counts as a conversion.',
    modelAnswer: 'Diese Woche wurden bei 500 Landingpage-Besuchen 25 Kontaktformulare abgeschickt. Ein abgeschicktes Formular zählt hier als Conversion; die Conversion-Rate beträgt 5 Prozent.',
    speakPrompt: 'Explain this rate to a colleague in German without assuming that they know the denominator. Then ask whether the comparison period uses the same definition.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I say that the denominator is 500 visits, not 500 leads or people?',
      'Did I define the conversion and name the reporting period?',
      'Did I say „fünf Prozent“ clearly and avoid claiming that this proves campaign success?'
    ],
    variation: 'A separate fictional week has 800 landing-page visits and 24 submitted forms. Work out the new rate and explain it in German. Keep the same conversion definition; do not assume why the rate changed.',
    curriculumWordIds: ['marketing-metrics-01', 'marketing-metrics-02', 'marketing-metrics-03', 'marketing-metrics-09', 'marketing-metrics-10', 'marketing-campaigns-06']
  },
  {
    id: 'marketing-metrics-ad-report',
    title: 'Klickrate und Kosten einordnen',
    category: 'metrics', level: 'B2',
    reading: 'Unser fiktiver Anzeigenbericht zeigt 20.000 Impressionen, 400 Klicks und 200 Euro Werbekosten. Die Klickrate beträgt 2 Prozent: 400 geteilt durch 20.000, mal 100. Die durchschnittlichen Kosten pro Klick liegen bei 0,50 Euro. Daraus wissen wir noch nicht, wie viele Käufe entstanden sind. Vor einer Budgetentscheidung prüfen wir deshalb die erfassten Conversions und die Zuordnung der Verkäufe.',
    translation: 'Our fictional ad report shows 20,000 impressions, 400 clicks and €200 in advertising costs. The click-through rate is 2 percent: 400 divided by 20,000, multiplied by 100. The average cost per click is €0.50. This does not yet tell us how many purchases resulted. Before making a budget decision, we therefore check recorded conversions and how sales were attributed.',
    phrases: [
      { de: 'die Impression; die Impressionen', en: 'impression; impressions' },
      { de: 'der Klick; die Klicks', en: 'click; clicks' },
      { de: 'das Budget; die Budgets', en: 'budget; budgets' },
      { de: 'Die Kosten pro Klick liegen bei 50 Cent.', en: 'The cost per click is 50 cents.' },
      { de: 'die Ergebnisse auswerten', en: 'to analyse the results' },
      { de: 'Daraus lässt sich noch kein Umsatz ableiten.', en: 'Revenue cannot yet be inferred from that.' }
    ],
    writePrompt: 'Write a concise German report comment with the click-through rate and cost per click. Add one reason why you would not increase the budget based only on those figures.',
    modelAnswer: 'Bei 20.000 Impressionen und 400 Klicks liegt die Klickrate bei 2 Prozent. Die Kosten pro Klick betragen 0,50 Euro. Bevor wir das Budget erhöhen, sollten wir prüfen, wie viele Käufe den Anzeigen zugeordnet wurden.',
    speakPrompt: 'A colleague says: „Viele Klicks bedeuten mehr Umsatz.“ Respond politely in German and explain what further information you need.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I distinguish clicks, impressions and purchases?',
      'Did I use clicks ÷ impressions for CTR and ad costs ÷ clicks for CPC?',
      'Did I state what remains unknown instead of presenting an assumption as a result?'
    ],
    variation: 'Use new fictional figures: 10,000 impressions, 300 clicks and €180 in ad costs. Report both rates and ask for purchase data before recommending a budget change.',
    curriculumWordIds: ['marketing-metrics-04', 'marketing-metrics-05', 'marketing-metrics-06', 'marketing-metrics-11', 'marketing-metrics-17', 'marketing-metrics-19', 'marketing-campaigns-14']
  },
  {
    id: 'marketing-campaigns-launch',
    title: 'Eine Kampagne startklar machen',
    category: 'campaigns', level: 'B1',
    reading: 'Unsere Kampagne soll am Dienstag starten. Die Werbeanzeige ist fertig, aber auf der Landingpage führt ein Button zur falschen Seite. Außerdem fehlt noch der Test für das Tracking. Wir korrigieren den Link und prüfen mit einer Testanfrage, ob das Ereignis erfasst wird. Danach stimmen wir den Start mit dem Team ab.',
    translation: 'Our campaign is due to start on Tuesday. The ad is ready, but a button on the landing page leads to the wrong page. The tracking test is also still outstanding. We correct the link and use a test enquiry to check whether the event is recorded. Then we coordinate the launch with the team.',
    phrases: [
      { de: 'die Kampagne; die Kampagnen', en: 'campaign; campaigns' },
      { de: 'die Werbeanzeige; die Werbeanzeigen', en: 'ad; ads' },
      { de: 'die Landingpage; die Landingpages', en: 'landing page; landing pages' },
      { de: 'eine Kampagne starten', en: 'to launch a campaign' },
      { de: 'Wird das Ereignis korrekt erfasst?', en: 'Is the event recorded correctly?' },
      { de: 'den Start mit dem Team abstimmen', en: 'to coordinate the launch with the team' }
    ],
    writePrompt: 'Write a German message saying that the ad is ready but the campaign still needs a corrected link and a tracking test.',
    modelAnswer: 'Die Werbeanzeige ist fertig. Vor dem Kampagnenstart müssen wir noch den Link auf der Landingpage korrigieren und das Tracking mit einer Testanfrage prüfen.',
    speakPrompt: 'Give a brief German launch update: what is ready, what is still open and what happens next?',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I separate completed work from the remaining checks?',
      'Did I explain what the tracking test should verify?',
      'Could I use „Vor dem Start müssen wir noch …“ with the action at the end?'
    ],
    variation: 'The link and tracking now work, but the mobile form is difficult to use. Replace the old blockers in your update with this new issue and propose a concrete next check.',
    curriculumWordIds: ['marketing-campaigns-01', 'marketing-campaigns-05', 'marketing-campaigns-06', 'marketing-campaigns-18', 'marketing-campaigns-19', 'marketing-meetings-02']
  },
  {
    id: 'marketing-campaigns-newsletter-test',
    title: 'Einen Newsletter-Test planen',
    category: 'campaigns', level: 'B2',
    reading: 'Wir möchten zwei Betreffzeilen für denselben Newsletter vergleichen. Inhalt, Versandzeit und Zielgruppe sollen vergleichbar bleiben. Die Empfänger werden zufällig auf zwei Gruppen verteilt. Vor dem Versand legen wir fest, wie wir den Test auswerten. Eine kleine Differenz allein reicht uns nicht, um eine Variante zum klaren Gewinner zu erklären.',
    translation: 'We want to compare two subject lines for the same newsletter. The content, send time and audience should remain comparable. Recipients are randomly assigned to two groups. Before sending, we decide how to evaluate the test. A small difference alone is not enough for us to call one variant a clear winner.',
    phrases: [
      { de: 'der Newsletter; die Newsletter', en: 'newsletter; newsletters' },
      { de: 'die Betreffzeile; die Betreffzeilen', en: 'subject line; subject lines' },
      { de: 'der A/B-Test; die A/B-Tests', en: 'A/B test; A/B tests' },
      { de: 'zwei Varianten miteinander vergleichen', en: 'to compare two variants with each other' },
      { de: 'vorab eine Kennzahl festlegen', en: 'to choose a metric in advance' },
      { de: 'Das Ergebnis ist noch nicht eindeutig.', en: 'The result is not yet conclusive.' }
    ],
    writePrompt: 'Propose two short German subject lines for an invitation to a CRM workshop. Add one sentence explaining what should stay the same in the test.',
    modelAnswer: 'Variante A: „CRM-Workshop: Kontakte besser organisieren“. Variante B: „Wie gut ist eure CRM-Datenqualität?“ Inhalt und Versandzeit sollten gleich bleiben; die Empfänger teilen wir zufällig auf.',
    speakPrompt: 'Explain the proposed test in German. Say what changes, what stays comparable and why an early small difference should be treated cautiously.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I identify the subject line as the planned difference?',
      'Did I mention random assignment and comparable conditions?',
      'Did I avoid declaring a winner without enough information?'
    ],
    variation: 'Now test the wording of a button instead of the subject line. Suggest two German button labels and name the outcome you would define before running that new test.',
    curriculumWordIds: ['marketing-campaigns-03', 'marketing-campaigns-07', 'marketing-campaigns-08', 'marketing-campaigns-09', 'marketing-creative-14', 'marketing-creative-20']
  },
  {
    id: 'marketing-meetings-next-steps',
    title: 'Die nächsten Schritte festhalten',
    category: 'meetings', level: 'B1',
    reading: 'Am Ende der Besprechung halten wir die nächsten Schritte fest. Ich überarbeite den Anzeigentext bis Mittwoch. Lena prüft die Landingpage am Donnerstag. Für die endgültige Freigabe ist Amir verantwortlich. Wir ergänzen die Aufgaben und Fristen im Protokoll, damit jede Person weiß, was sie als Nächstes tun soll.',
    translation: 'At the end of the meeting, we record the next steps. I will revise the ad copy by Wednesday. Lena will check the landing page on Thursday. Amir is responsible for final approval. We add the tasks and deadlines to the meeting notes so everyone knows what to do next.',
    phrases: [
      { de: 'die Besprechung; die Besprechungen', en: 'meeting; meetings' },
      { de: 'die Aufgabe; die Aufgaben', en: 'task; tasks' },
      { de: 'die Frist; die Fristen', en: 'deadline; deadlines' },
      { de: 'die nächsten Schritte festhalten', en: 'to record the next steps' },
      { de: 'Wer ist für die Freigabe verantwortlich?', en: 'Who is responsible for approval?' },
      { de: 'Ich übernehme das bis Mittwoch.', en: 'I will take care of that by Wednesday.' }
    ],
    writePrompt: 'Write a German meeting follow-up assigning the copy revision to yourself by Wednesday and the landing-page check to Lena on Thursday. Ask Amir for final approval afterwards.',
    modelAnswer: 'Ich überarbeite den Anzeigentext bis Mittwoch. Lena prüft die Landingpage am Donnerstag. Amir, kannst du danach die endgültige Freigabe übernehmen?',
    speakPrompt: 'Close the meeting in German by summarising the three next steps. Make the owners and dates clear, then check whether everyone agrees.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I connect each task with a named owner?',
      'Did I distinguish „bis Mittwoch“ (by Wednesday) from „am Donnerstag“ (on Thursday)?',
      'Did I invite confirmation, for example with „Passt das für euch?“?'
    ],
    variation: 'Lena is unavailable on Thursday. Propose a revised owner or date, and ask whether that affects the final approval. Do not simply repeat the original plan.',
    curriculumWordIds: ['marketing-meetings-01', 'marketing-meetings-03', 'marketing-meetings-05', 'marketing-meetings-06', 'marketing-meetings-08', 'marketing-meetings-09', 'marketing-meetings-11', 'marketing-meetings-17']
  },
  {
    id: 'marketing-meetings-deadline',
    title: 'Eine Frist realistisch abstimmen',
    category: 'meetings', level: 'B2',
    reading: 'Der neue Entwurf soll heute freigegeben werden. Uns fehlen jedoch noch die Produktangaben, die der Vertrieb bestätigen muss. Ich erkläre die Abhängigkeit und schlage vor, heute das Layout zu prüfen. Den Text können wir nach Eingang der Angaben fertigstellen. Gemeinsam klären wir, ob die Kampagne dadurch später starten muss.',
    translation: 'The new draft is supposed to be approved today. However, we are still missing the product details that sales must confirm. I explain the dependency and suggest reviewing the layout today. We can finish the copy once the details arrive. Together, we clarify whether this means the campaign must launch later.',
    phrases: [
      { de: 'die Abhängigkeit; die Abhängigkeiten', en: 'dependency; dependencies' },
      { de: 'der Zeitplan; die Zeitpläne', en: 'schedule; schedules' },
      { de: 'der Entwurf; die Entwürfe', en: 'draft; drafts' },
      { de: 'Uns fehlen noch die bestätigten Produktangaben.', en: 'We still need the confirmed product details.' },
      { de: 'Können wir die Frist gemeinsam anpassen?', en: 'Can we adjust the deadline together?' },
      { de: 'Ich schlage vor, zuerst das Layout zu prüfen.', en: 'I suggest checking the layout first.' }
    ],
    writePrompt: 'Write a polite German message explaining the missing dependency and proposing useful work that can happen today. Avoid promising a final date you cannot confirm.',
    modelAnswer: 'Für die endgültige Textfreigabe fehlen uns noch die bestätigten Produktangaben. Ich schlage vor, heute das Layout zu prüfen und den Zeitplan anzupassen, sobald wir eine Rückmeldung vom Vertrieb haben.',
    speakPrompt: 'Explain the delay to a colleague in German. State the blocker, offer a next step and ask what must be prioritised.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I name the dependency without blaming the other team?',
      'Did I offer a specific next step rather than only refusing the deadline?',
      'Did I avoid an unsupported promise and ask about priorities?'
    ],
    variation: 'The product details arrive, but the designer now has no capacity until tomorrow. Explain the changed situation and negotiate what can realistically be delivered first.',
    curriculumWordIds: ['marketing-meetings-03', 'marketing-meetings-05', 'marketing-meetings-12', 'marketing-meetings-14', 'marketing-meetings-15', 'marketing-meetings-19', 'marketing-creative-02', 'marketing-creative-13']
  },
  {
    id: 'marketing-creative-brief',
    title: 'Ein klares Creative-Briefing schreiben',
    category: 'creative', level: 'B1',
    reading: 'Wir brauchen ein Werbemittel für einen kostenlosen CRM-Workshop. Die Zielgruppe sind kleine Marketingteams. Die wichtigste Botschaft lautet: „Kontakte besser organisieren“. Das Briefing nennt das Format, die Tonalität und die gewünschte Handlungsaufforderung. Der Entwurf soll bis Freitag vorliegen. So kann das Designteam gezielt arbeiten und bei offenen Fragen nachhaken.',
    translation: 'We need a creative asset for a free CRM workshop. The target audience is small marketing teams. The main message is: “Organise contacts better”. The brief specifies the format, tone and desired call to action. The draft should be ready by Friday. This helps the design team work with a clear purpose and ask about anything that remains unclear.',
    phrases: [
      { de: 'das Werbemittel; die Werbemittel', en: 'creative asset; creative assets' },
      { de: 'das Briefing; die Briefings', en: 'brief; briefs' },
      { de: 'die Handlungsaufforderung; die Handlungsaufforderungen', en: 'call to action; calls to action' },
      { de: 'die wichtigste Botschaft festlegen', en: 'to define the main message' },
      { de: 'Der Entwurf soll bis Freitag vorliegen.', en: 'The draft should be ready by Friday.' },
      { de: 'bei offenen Fragen nachhaken', en: 'to follow up on unanswered questions' }
    ],
    writePrompt: 'Write a short German creative brief for the fictional CRM workshop. Include the audience, main message and a clear call to action.',
    modelAnswer: 'Wir sprechen kleine Marketingteams an. Die Botschaft lautet: „Kontakte besser organisieren“. Bitte gestaltet eine übersichtliche Anzeige mit der Handlungsaufforderung „Zum kostenlosen Workshop anmelden“.',
    speakPrompt: 'Brief a designer in German. Explain who the asset is for, what it should communicate and what the viewer should do next.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I identify an audience and a single main message?',
      'Did I give a concrete call to action instead of just „Mach es schöner“?',
      'Did I use the article in „das Werbemittel“ and distinguish the draft from the final asset?'
    ],
    variation: 'Change the offer to a downloadable CRM checklist for sales teams. Write a new main message and call to action that fit the new audience and action.',
    curriculumWordIds: ['marketing-creative-01', 'marketing-creative-02', 'marketing-creative-05', 'marketing-creative-08', 'marketing-creative-10', 'marketing-creative-11', 'marketing-creative-18', 'marketing-strategy-01']
  },
  {
    id: 'marketing-creative-feedback',
    title: 'Hilfreiches Feedback zu einem Entwurf geben',
    category: 'creative', level: 'B2',
    reading: 'Der erste Entwurf wirkt übersichtlich, aber die Überschrift bleibt sehr allgemein. Ich bitte darum, den konkreten Nutzen des Angebots zu nennen. Außerdem ist die Handlungsaufforderung auf dem Smartphone schwer zu lesen. Wir überarbeiten zuerst diese beiden Punkte und prüfen danach, ob die neue Variante zu unseren Markenrichtlinien passt.',
    translation: 'The first draft looks clear, but the headline is still very general. I ask for the specific benefit of the offer to be stated. The call to action is also difficult to read on a smartphone. We revise these two points first and then check whether the new variant fits our brand guidelines.',
    phrases: [
      { de: 'die Überschrift; die Überschriften', en: 'headline; headlines' },
      { de: 'die Variante; die Varianten', en: 'variant; variants' },
      { de: 'die Markenrichtlinie; die Markenrichtlinien', en: 'brand guideline; brand guidelines' },
      { de: 'den Text gezielt überarbeiten', en: 'to revise the copy with a specific purpose' },
      { de: 'Könntest du den Nutzen konkreter formulieren?', en: 'Could you describe the benefit more specifically?' },
      { de: 'Auf dem Smartphone ist der Text schwer zu lesen.', en: 'The text is difficult to read on a smartphone.' }
    ],
    writePrompt: 'Give polite German feedback on the fictional draft. Acknowledge one useful aspect, then request a more specific headline and a clearer mobile call to action.',
    modelAnswer: 'Der Entwurf ist übersichtlich. Könntest du in der Überschrift den konkreten Nutzen nennen und die Handlungsaufforderung auf dem Smartphone besser lesbar machen? Danach prüfen wir die neue Variante gemeinsam.',
    speakPrompt: 'Discuss the draft with its designer in German. Explain a specific observation, why it matters and which change should come first.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I describe something observable instead of presenting personal taste as a fact?',
      'Did I connect each requested change to a user need?',
      'Could I soften a request with „Könntest du …?“ while keeping it specific?'
    ],
    variation: 'The headline and button are now clear, but the image suggests a different offer. Give fresh feedback about the image and propose a criterion for choosing a replacement.',
    curriculumWordIds: ['marketing-creative-02', 'marketing-creative-04', 'marketing-creative-05', 'marketing-creative-12', 'marketing-creative-14', 'marketing-creative-16', 'marketing-creative-19', 'marketing-meetings-04']
  },
  {
    id: 'marketing-strategy-customer-need',
    title: 'Eine Kundenhypothese prüfen',
    category: 'strategy', level: 'B2',
    reading: 'Wir vermuten, dass kleine Marketingteams viel Zeit mit doppelten Kontaktdaten verlieren. Das ist zunächst eine Hypothese, keine gesicherte Erkenntnis. In Gesprächen fragen wir nach konkreten Abläufen und Beispielen aus dem Arbeitsalltag. Danach vergleichen wir die Antworten und prüfen, ob unser Nutzenversprechen tatsächlich zu dem beschriebenen Kundenbedürfnis passt.',
    translation: 'We suspect that small marketing teams lose a lot of time dealing with duplicate contact data. Initially, this is a hypothesis, not an established finding. In conversations, we ask about specific workflows and examples from day-to-day work. We then compare the answers and check whether our value proposition actually fits the customer need they describe.',
    phrases: [
      { de: 'die Hypothese; die Hypothesen', en: 'hypothesis; hypotheses' },
      { de: 'das Kundenbedürfnis; die Kundenbedürfnisse', en: 'customer need; customer needs' },
      { de: 'die Erkenntnis; die Erkenntnisse', en: 'finding; findings' },
      { de: 'eine Hypothese anhand konkreter Beispiele prüfen', en: 'to test a hypothesis against specific examples' },
      { de: 'Wie sind Sie beim letzten Mal vorgegangen?', en: 'How did you approach it last time?' },
      { de: 'das Nutzenversprechen an den Bedarf anpassen', en: 'to adapt the value proposition to the need' }
    ],
    writePrompt: 'Write two open German interview questions about managing contact data. Ask about actual past work rather than whether someone likes your proposed product.',
    modelAnswer: 'Wie haben Sie beim letzten Datenimport doppelte Kontakte erkannt? Was haben Sie anschließend mit diesen Kontakten gemacht?',
    speakPrompt: 'Introduce the hypothesis in German as something you still need to check. Then ask a neutral question about a real recent example.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I mark the idea as a hypothesis rather than a proven customer fact?',
      'Did I ask an open question about past behaviour without suggesting the desired answer?',
      'Did I keep formal „Sie“ consistent when addressing the interview participant?'
    ],
    variation: 'Your next interview suggests that handovers, rather than duplicate data, cause the main difficulty. Reformulate the hypothesis and ask a fresh question about the last handover.',
    curriculumWordIds: ['marketing-strategy-01', 'marketing-strategy-04', 'marketing-strategy-05', 'marketing-strategy-07', 'marketing-strategy-13', 'marketing-strategy-14', 'marketing-crm-15']
  },
  {
    id: 'marketing-strategy-priorities',
    title: 'Maßnahmen begründet priorisieren',
    category: 'strategy', level: 'B2',
    reading: 'Für das nächste Quartal stehen drei Maßnahmen zur Auswahl: eine neue Landingpage, eine Kundenumfrage und zusätzliche Anzeigen. Unser Ziel ist, qualifizierte Anfragen zu gewinnen. Wir haben jedoch noch wenig darüber gelernt, warum passende Interessenten das Formular abbrechen. Deshalb schlagen wir zunächst Gespräche und eine Prüfung des Formulars vor. Über zusätzliche Ausgaben entscheiden wir mit den neuen Erkenntnissen.',
    translation: 'We are considering three initiatives for next quarter: a new landing page, a customer survey and additional ads. Our goal is to generate qualified enquiries. However, we still know little about why suitable prospects abandon the form. We therefore first propose conversations and a review of the form. We will decide on additional spending using the new findings.',
    phrases: [
      { de: 'das Ziel; die Ziele', en: 'goal; goals' },
      { de: 'die Maßnahme; die Maßnahmen', en: 'initiative; initiatives' },
      { de: 'die Umfrage; die Umfragen', en: 'survey; surveys' },
      { de: 'Maßnahmen nach ihrem Beitrag zum Ziel priorisieren', en: 'to prioritise initiatives by their contribution to the goal' },
      { de: 'Welche Annahme müssen wir zuerst prüfen?', en: 'Which assumption do we need to test first?' },
      { de: 'Ich würde zunächst die Ursache untersuchen.', en: 'I would investigate the cause first.' }
    ],
    writePrompt: 'Recommend a first step in German for this fictional situation. Link it to the goal and name one important uncertainty. Another well-reasoned priority is also valid.',
    modelAnswer: 'Ich würde zuerst das Formular prüfen und mit passenden Interessenten sprechen. Unser Ziel sind qualifizierte Anfragen; bisher wissen wir aber nicht, warum diese Interessenten das Formular abbrechen.',
    speakPrompt: 'Make a brief German recommendation to the team. Explain your priority, the uncertainty behind it and what information could change your decision.',
    checklist: [
      'Self-review only: this app does not automatically grade your speech.',
      'Did I connect the recommendation to a stated goal?',
      'Did I name an uncertainty instead of assuming that more advertising will solve it?',
      'Did I allow for a different decision if new evidence appears?'
    ],
    variation: 'New observations show that the form works well, but few relevant prospects reach the page. Revise your recommendation and explain which assumption has changed.',
    curriculumWordIds: ['marketing-strategy-02', 'marketing-strategy-03', 'marketing-strategy-12', 'marketing-strategy-14', 'marketing-strategy-20', 'marketing-campaigns-06', 'marketing-campaigns-20']
  }
];

if (typeof module !== 'undefined') module.exports = MarketingScenarios;
