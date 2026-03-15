import React from "react";

function CategoryCart({ data }) {
  if (!data) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

        .wx-cat {
          font-family: 'Plus Jakarta Sans', sans-serif;
          flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          cursor: pointer;
          width: clamp(68px, 13vw, 104px);
          overflow: visible;
        }

        .wx-cat-ring {
          width: clamp(58px, 11vw, 88px);
          height: clamp(58px, 11vw, 88px);
          border-radius: 50%;
          overflow: hidden; position: relative; flex-shrink: 0;
          border: 3px solid transparent;
          background: white;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        /* gradient border via background-image trick */
        .wx-cat-ring::before {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35, #ff3cac, #a855f7, #14b8a6);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.25s;
        }

        .wx-cat:hover .wx-cat-ring {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 12px 28px rgba(255,107,53,0.25);
        }
        .wx-cat:hover .wx-cat-ring::before { opacity: 1; }

        .wx-cat-ring img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; border-radius: 50%;
          transition: transform 0.45s;
        }
        .wx-cat:hover .wx-cat-ring img { transform: scale(1.1); }

        .wx-cat-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: radial-gradient(circle at 60% 60%, rgba(255,107,53,0.3), transparent 65%);
          opacity: 0; transition: opacity 0.25s;
        }
        .wx-cat:hover .wx-cat-overlay { opacity: 1; }

        .wx-cat-name {
          margin-top: 8px;
          font-family: 'Nunito', sans-serif;
          font-size: clamp(9px, 1.8vw, 12px); font-weight: 800;
          color: #6b7280; text-align: center; line-height: 1.3;
          text-transform: capitalize;
          max-width: 100%; overflow: hidden;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          word-break: break-word;
          transition: color 0.2s;
        }
        .wx-cat:hover .wx-cat-name { color: #ff6b35; }

        .wx-cat-dot {
          margin-top: 5px;
          width: 5px; height: 5px; border-radius: 50%;
          background: linear-gradient(135deg, #ff6b35, #ff3cac);
          opacity: 0; transform: scale(0.3);
          transition: opacity 0.25s, transform 0.25s;
        }
        .wx-cat:hover .wx-cat-dot { opacity: 1; transform: scale(1); }
      `}</style>

      <div className="wx-cat">
        <div className="wx-cat-ring">
          <img src={data.image} alt={data.name} loading="lazy" />
          <div className="wx-cat-overlay" />
        </div>
        <p className="wx-cat-name">{data.name}</p>
        <div className="wx-cat-dot" />
      </div>
    </>
  );
}

export default CategoryCart;