// utils/chatUtils.js
export const sanitizeSearchText = (text) => {
  const sanitized = text
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 2)
    .join(" & ");

  return sanitized;
};

export const getRelevantContext = async (supabase, userInput) => {
  try {
    const searchText = sanitizeSearchText(userInput);

    if (!searchText) {
      return [];
    }

    const { data, error } = await supabase
      .from("context_memory")
      .select("*")
      .textSearch("content_search", searchText)
      .order("confidence_score", { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting context:", error);
    return [];
  }
};

export const saveContext = async (
  supabase,
  content,
  messageId,
  category = "general"
) => {
  try {
    const { data, error } = await supabase
      .from("context_memory")
      .insert({
        content,
        category,
        source_message_id: messageId,
        confidence_score: 1.0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving context:", error);
    return null;
  }
};
