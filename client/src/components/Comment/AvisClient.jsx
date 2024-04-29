import { useState } from "react";
import "./AvisClient.css";
import "./AvisClientResponsive.css";

function AvisClient() {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Jean Dupont",
      date: "10/04/2024",
      content: "Super service !",
      rating: 5,
    },
    {
      id: 2,
      user: "Marie Martin",
      date: "12/04/2024",
      content: "J'ai adoré, je recommande !",
      rating: 4,
    },
  ]);

  const [newComment, setNewComment] = useState({
    user: "",
    content: "",
    rating: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewComment({ ...newComment, [name]: value });
  };

  const handleRatingChange = (rating) => {
    setNewComment({ ...newComment, rating });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = Math.floor(Math.random() * 10000) + 1;
    const comment = {
      id,
      ...newComment,
      date: new Date().toLocaleDateString(),
    };
    setComments([...comments, comment]);
    setNewComment({ user: "", content: "", rating: 0 });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      if (i <= rating) {
        stars.push(
          <span
            key={i}
            onClick={() => handleRatingChange(i)}
            onKeyDown={() => handleRatingChange(i)}
            role="presentation"
          >
            &#9733;
          </span>
        );
      } else {
        stars.push(
          <span
            key={i}
            onClick={() => handleRatingChange(i)}
            onKeyDown={() => handleRatingChange(i)}
            role="presentation"
          >
            &#9734;
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="comment-space">
      <h2 className="h2">Commentaires</h2>
      <div className="comments">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p className="user-comment">{comment.user}</p>
            <p className="date">{comment.date}</p>
            <div className="rating">{renderStars(comment.rating)}</div>
            <p className="content">{comment.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="comment-form">
        <h3>Ajouter un commentaire</h3>
        <input
          type="text"
          name="user"
          placeholder="Votre nom"
          value={newComment.user}
          onChange={handleChange}
          required
        />
        <div className="rating">{renderStars(newComment.rating)}</div>
        <textarea
          name="content"
          placeholder="Votre commentaire"
          value={newComment.content}
          onChange={handleChange}
          required
        />

        <button id="boutton" type="submit">
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default AvisClient;
