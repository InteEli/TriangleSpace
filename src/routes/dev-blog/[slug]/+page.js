// src/routes/devblog/[slug]/+page.js

export const prerender = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {

  // Dynamically import all .svx files in the current directory 
  const allPosts = import.meta.glob('../*.svx');
  // Extract import function for the specific post based on the slug
  const postImport = allPosts["../"+params.slug+".svx"];

  // Check if the post import function exists
  if (!postImport) {
    throw new Error("Post not found: "+params.slug);
  }
  // Import the specific post 
  const post = await postImport();
  const { title, date } = post.metadata;
  const content = post.default;

  return {
    content,
    title,
    date,
  };
}
