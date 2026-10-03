// EDIT THIS FILE to change the site's shared content types and data loader.

export type Rule = {
  id: string;
  num: string;
  title: string;
  summary: string;
  body: string;
};

export type Section = {
  id: string;
  label: string;
  intro: string;
  verbatim?: boolean;
  rules: Rule[];
};

export async function loadSections(): Promise<Section[]> {
  const response = await fetch("/rules.json");
  if (!response.ok) {
    throw new Error(`Failed to load rules: ${response.status}`);
  }

  return (await response.json()) as Section[];
}
