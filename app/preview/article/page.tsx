"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, AlertCircle } from "lucide-react";

interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
}

const ArticlePreview = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const secret = searchParams.get("secret");

  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || secret !== process.env.NEXT_PUBLIC_PREVIEW_SECRET) {
      setError("Unauthorized preview.");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&publicationState=preview`
        );
        const result = await res.json();

        if (result.data?.length > 0) {
          const article = result.data[0];
          setArticle(article);
        } else {
          setError("Article not found.");
        }
      } catch (err) {
        setError("Failed to fetch article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, secret]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-100 border border-red-300 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!article) return null;
  const cleanContent = (content: string) => {
    return content.replace(/\\n/g, "\n");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-xl p-6 space-y-4 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
        <div className="markdown">
        <ReactMarkdown>{article.content.replaceAll("\\n", "  \n")}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreview;
