import { useState, useEffect } from 'react';

export default function usePosts() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}posts.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`);
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => {
        console.error(err);
        setPosts([]);
      });
  }, []);

  return posts;
}
