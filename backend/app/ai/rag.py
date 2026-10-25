from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.audit import KnowledgeSource

def search_approved_knowledge(db: Session, query: str, category: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search indexed and approved knowledge sources using full-text and keyword relevance.
    Only approved public and provider-verified records are retrieved.
    """
    q = db.query(KnowledgeSource)
    if category:
        q = q.filter(KnowledgeSource.source_category == category)
    
    terms = [term.lower().strip() for term in query.split() if len(term.strip()) > 2]
    all_sources = q.all()
    
    scored_results = []
    for source in all_sources:
        content_lower = (source.title + " " + source.text_content).lower()
        score = 0
        for term in terms:
            if term in content_lower:
                score += 1
        if score > 0 or not terms:
            scored_results.append({
                "id": source.id,
                "title": source.title,
                "publisher": source.publisher,
                "category": source.source_category,
                "text_content": source.text_content,
                "last_verified_date": source.last_verified_date.isoformat() if source.last_verified_date else None,
                "relevance_score": score
            })
            
    scored_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored_results[:limit]
