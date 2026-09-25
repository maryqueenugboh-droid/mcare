# Requirements and implementation evidence

The four objectives are copied in meaning from Chapter One. They are not expanded into six different objectives.

| Objective | Implemented modules | Executed evidence | Remaining verification |
| --- | --- | --- | --- |
| Record and track maternal pregnancy information | Pregnancy profile, due-date estimate, maternal measurements, notes, weight chart data | API pregnancy and measurement cases; DOM pregnancy and maternal-form checks | Visual chart inspection and clinical review |
| Schedule antenatal care and provide automated reminders | Appointment create/edit/delete, status filtering, duplicate-time rejection, computed reminders and read acknowledgement | API appointment/reminder/version tests; DOM create/edit and reminder checks | Real device timing and closed-tab limitations demonstration |
| Track child immunization, growth and milestones | Child profiles, child-linked growth, milestone observations, clinic-entered vaccine dates and completion | API ownership/dependency/child cases; DOM child/growth/milestone/vaccine checks | Visual growth chart and provider review of entered schedules |
| Integrate education and healthcare communication | Sourced articles, selected provider relationship, mother–provider messaging and unread state | API messaging, relationship revocation and content access tests; DOM two-way messaging/content tests | Mother/provider usability acceptance |

Supporting requirements include registration, authentication, profile management, administrator management, facilities, emergency guidance, record export, medication reminders and audit metadata. No AI, IoT, blockchain or hospital-record integration has been added.

## Methodology

Waterfall stages: requirements analysis → system design → implementation → verification → maintenance preparation. Defects identified during verification return to the affected implementation/design step and are retested. The project is implemented by one developer; no Scrum roles, sprint ceremonies or multi-person Agile practices are claimed.

## Test boundaries

20 API subtests and 12 DOM integration cases passed. The Node test runner also counts the parent API suite as a test, producing 21 test entries; the report correctly calls these 20 subtests. Neither execution establishes real-user acceptance, clinical safety, visual layout correctness, concurrent production capacity or improved health outcomes. Browser execution was blocked by environment restrictions, not by an observed app failure; its prepared script is supplied for local completion.
