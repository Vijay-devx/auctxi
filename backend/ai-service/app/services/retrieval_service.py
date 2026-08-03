"""
Retrieval Service — FAISS-based RAG for platform knowledge.

Paths and URLs are read from config.py (which reads .env).
"""
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings
from app.config import RAGConfig, LLMConfig


class RetrievalService:
    def __init__(self):
        self.embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=LLMConfig.OLLAMA_URL,
        )
        try:
            self.vectorstore = FAISS.load_local(
                folder_path=RAGConfig.FAISS_INDEX_PATH,
                embeddings=self.embeddings,
                allow_dangerous_deserialization=True,
            )
            self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
            print("FAISS Index loaded successfully.")
        except Exception as e:
            print(f"Warning: Could not load FAISS index. Did you run ingest.py? Error: {e}")
            self.retriever = None

    def get_context(self, query: str, role: str) -> str:
        """Retrieve relevant documents, optionally guided by the user role."""
        if not self.retriever:
            try:
                self.vectorstore = FAISS.load_local(
                    folder_path=RAGConfig.FAISS_INDEX_PATH,
                    embeddings=self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
            except Exception:
                return "No knowledge base available."

        enhanced_query = f"[{role}] {query}"
        docs = self.retriever.invoke(enhanced_query)

        context = "\n\n".join([doc.page_content for doc in docs])
        return context


# Singleton instance
retrieval_service = RetrievalService()
