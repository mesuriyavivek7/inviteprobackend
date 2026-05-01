export type CreateFaqInput = {
  question: string;
  answer: string;
};

/** Single item, `{ faqs: [...] }`, or a raw JSON array of items */
export type CreateFaqRequest = CreateFaqInput | { faqs: CreateFaqInput[] } | CreateFaqInput[];

export type UpdateFaqInput = {
  question?: string;
  answer?: string;
};
