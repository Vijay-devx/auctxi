import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings

# Load environment variables
load_dotenv()
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = "nomic-embed-text"

def ingest_documents():
    print("Loading documents from knowledge base...")
    # Load all markdown files recursively
    loader = DirectoryLoader('./knowledge', glob="**/*.md", loader_cls=TextLoader)
    documents = loader.load()
    
    if not documents:
        print("No documents found in ./knowledge directory.")
        return

    print(f"Loaded {len(documents)} documents. Splitting into chunks...")
    
    # Split documents into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    
    print(f"Created {len(chunks)} chunks. Generating embeddings and storing in FAISS...")
    
    # Initialize Ollama embeddings pointing to the local instance
    embeddings = OllamaEmbeddings(
        model=MODEL_NAME,
        base_url=OLLAMA_URL
    )
    
    # Create the FAISS vector store
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Save the index to disk
    vectorstore.save_local(FAISS_INDEX_PATH)
    
    print(f"Ingestion complete. Vector store saved to {FAISS_INDEX_PATH}")

if __name__ == "__main__":
    ingest_documents()
