<!-- ============================================================
     SKILL TEMPLATE ENGINE — SKILL TEMPLATE DEFINITION TEMPLATE

     Use this when authoring a new SkillTemplate TypeScript file
     to add to the skills-catalog/.

     FIXED ZONES: Marked with [FIXED]. Structure does not change.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.
     ============================================================ -->

<!-- [FIXED] File header -->
// [VARIABLE: skill-slug].ts
// SkillTemplate definition for [VARIABLE: Human-readable skill name]
// Category: [VARIABLE: content niche — e.g., tech commentary, marketing, long-form]

<!-- [FIXED] Import and type declaration -->
import type { SkillTemplate } from "./_schema";

<!-- [FIXED] Export statement -->
export const [VARIABLE: camelCaseSkillName]: SkillTemplate = {

  <!-- [FIXED] Identity fields -->
  slug: "[VARIABLE: kebab-case-slug]",
  name: "[VARIABLE: Human-Readable Name]",
  version: "1.0.0",

  <!-- [FIXED] brief_schema — declares what the user must provide -->
  brief_schema: {
    required: [
      <!-- [VARIABLE] List required field names as strings -->
      "[VARIABLE: topic]",
      "[VARIABLE: angle]",
      "[VARIABLE: target_outlet]"
    ],
    optional: [
      <!-- [VARIABLE] List optional field names -->
      "[VARIABLE: tone_override]",
      "[VARIABLE: additional_constraints]"
    ],
    fields: {
      <!-- [VARIABLE] One entry per field: name, type, description, min_length -->
      "[VARIABLE: topic]": {
        type: "string",
        description: "[VARIABLE: What this field asks the user to provide]",
        min_length: [VARIABLE: 10],
        example: "[VARIABLE: A realistic example value]"
      },
      "[VARIABLE: angle]": {
        type: "string",
        description: "[VARIABLE: The specific stance or framing for this piece]",
        min_length: [VARIABLE: 15],
        example: "[VARIABLE: Example angle]"
      },
      "[VARIABLE: target_outlet]": {
        type: "string",
        description: "[VARIABLE: Where this will be published — affects register and conventions]",
        min_length: [VARIABLE: 5],
        example: "[VARIABLE: tech newsletter, industry blog, etc.]"
      }
      <!-- [VARIABLE] Add more fields as needed -->
    },
    default_word_count: [VARIABLE: 900]
  },

  <!-- [FIXED] prompt_architecture — the layered prompt structure -->
  prompt_architecture: {

    <!-- [VARIABLE] genre: genre conventions as verbatim system text -->
    genre: `[VARIABLE: Describe the genre conventions this skill enforces.
Examples: voice register, structural norms, what makes this content type
human-quality, what distinguishes expert from novice output.
This block is injected verbatim as part of the system prompt.
Do NOT include word count instructions here — those go in scaffolding.]`,

    <!-- [VARIABLE] scaffolding: required structure with placeholders -->
    scaffolding: `[VARIABLE: Define the required sections and their order.
Use {{word_count}} and {{length_tier}} placeholders.
Example:
Structure this piece as follows:
- Hook ({{length_tier === "short" ? "1 paragraph" : "2 paragraphs"}})
- Core argument (3-4 paragraphs)
- Supporting evidence (2-3 paragraphs)
- Conclusion (1 paragraph)
Total length: approximately {{word_count}} words.]`,

    <!-- [FIXED] constraints: array of hard rules -->
    constraints: [
      "[VARIABLE: Constraint 1 — what output must never do]",
      "[VARIABLE: Constraint 2 — structural or tonal hard rule]",
      "[VARIABLE: Constraint 3 — length or citation rule]"
      <!-- [VARIABLE] Add more constraints. Minimum 3. -->
    ],

    <!-- [VARIABLE] tone: voice and register directives -->
    tone: `[VARIABLE: Describe the default tone and register for this skill.
Include: formality level, sentence rhythm, vocabulary register.
If tone overrides are allowed, use {{tone_override}} placeholder here.
Example: Write in a confident, direct voice. Sentences vary between
short punches and longer analytical moves. Register is {{tone_override || "informed-professional"}}.
Avoid hedging language ("perhaps", "maybe", "it seems").]`,

    <!-- [VARIABLE] user_template: the user message with field + source placeholders -->
    user_template: `[VARIABLE: Write the user message template.
Include {{field_name}} placeholders for every field in brief_schema.
Include {{sources}} where source excerpts should be injected.
Example:
Write a {{word_count}}-word [skill-name] on the following topic.

Topic: {{topic}}
Angle: {{angle}}
Target outlet: {{target_outlet}}

{{sources}}

Follow the structure and constraints in the system prompt exactly.]`,

    <!-- [VARIABLE] allowed_tone_overrides — whitelist or omit -->
    allowed_tone_overrides: [
      "[VARIABLE: allowed-tone-1]",
      "[VARIABLE: allowed-tone-2]"
      <!-- [VARIABLE] Remove this field entirely if no overrides are allowed -->
    ]
  },

  <!-- [FIXED] quality_markers — what good output looks like -->
  quality_markers: {
    min_words: [VARIABLE: 800],
    max_words: [VARIABLE: 1000],
    required_sections: [
      "[VARIABLE: section-name-1]",
      "[VARIABLE: section-name-2]"
      <!-- [VARIABLE] Match the sections declared in scaffolding -->
    ],
    citation_required: [VARIABLE: true],
    <!-- [VARIABLE] Add skill-specific quality checks as needed -->
    custom_checks: [
      "[VARIABLE: Custom quality check description]"
    ]
  }

};
