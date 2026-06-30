# StepSpark Visual Media Strategy

StepSpark should use visuals when they improve rapid recognition, not as decoration.

## When To Use Images

- Use real open-license or public-domain medical images for histology, pathology, radiology, anatomy, and gross findings when the image pattern is the tested clue.
- Use original diagrams for physiology, biochemistry, embryology, mechanisms, flowcharts, and mnemonics when a simplified visual is more useful than a clinical photo.
- Use charts or graphs when the learning objective depends on a relationship, threshold, trend, or comparative pattern.
- Do not add images that merely repeat text or make the card visually busy.

## Asset Requirements

Every visual asset must include:

- `kind`
- `title`
- `description`
- `imageUrl`
- `sourceName`
- `license`
- `provenance`
- `useCase`

Open medical images must include `sourceUrl` and attribution when the license requires it.

## Current Local LLM Roles

Installed Ollama models:

- `qwen3:30b`: reasoning model. Use it to draft visual concepts, summarize why a visual belongs on a card, generate alt-text drafts, and propose review checklists.
- `qwen2.5vl:7b`: vision model. Use it to inspect local visual assets, draft captions, detect obvious low-quality images, and flag possible answer-spoiling labels or PHI concerns.

These models are not image-generation models. They should not be treated as a bitmap generator. If StepSpark later needs local generated medical illustrations, add a dedicated local image model and keep all generated assets marked as draft until reviewed.

## Review Rules

- Generated diagrams are educational aids, not medical evidence.
- Real histology/radiology/pathology images should be preferred over generated images when diagnostic appearance matters.
- Do not use patient-identifiable images.
- Do not use images with unclear copyright status.
- Do not reveal answer-bearing captions before the learner reveals the card.
- Keep media draft until medical education review confirms accuracy.

## Seed Media Sources Added

- National Cancer Institute via Wikimedia Commons: Reed-Sternberg cell, public domain.
- RJDS MEDIX via Wikimedia Commons: bite cells, CC BY-SA 4.0.
- JasonRobertYoungMD via Wikimedia Commons: double-bubble radiograph, CC BY-SA 4.0.
- Ed Uthman via Wikimedia Commons: papillary thyroid carcinoma FNA, CC BY 2.0.
- Jensflorian via Wikimedia Commons: sarcoidosis histology, CC BY-SA 4.0.

Original local SVG diagrams were added for DiGeorge syndrome, HOCM maneuvers, B12 neurologic clue, Trousseau syndrome, and Behcet disease.
