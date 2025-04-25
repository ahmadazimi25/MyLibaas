import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  Verified,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';

const CommunityFeed = () => {
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', image: null });

  // Temporary data - replace with API calls
  const posts = [
    {
      id: 1,
      user: {
        name: 'Zara A.',
        avatar: 'Z',
        verified: true,
        role: 'Style Curator'
      },
      image: '/images/style-post-1.jpg',
      caption: 'Styling this traditional Afghan dress for a modern look! Perfect for both casual and formal occasions. #ModernEthnic #StyleTips',
      likes: 234,
      comments: 45,
      tags: ['ModernEthnic', 'StyleTips', 'AfghanFashion'],
      collection: 'The Herat Bride Edit'
    },
    {
      id: 2,
      user: {
        name: 'Sarah M.',
        avatar: 'S',
        verified: true,
        role: 'Fashion Blogger'
      },
      image: '/images/style-post-2.jpg',
      caption: 'My favorite pieces from the Eid collection! Swipe to see how I styled them differently. #EidFashion',
      likes: 189,
      comments: 32,
      tags: ['EidFashion', 'ModestFashion', 'StyleInspiration'],
      collection: 'Minimalist Wardrobe'
    }
  ];

  const handlePostSubmit = () => {
    // Handle post submission
    setShowPostDialog(false);
    setNewPost({ caption: '', image: null });
  };

  const PostCard = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{post.user.avatar}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.user.name}
              </Typography>
              {post.user.verified && (
                <Verified color="primary" sx={{ fontSize: 16 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {post.user.role}
            </Typography>
          </Box>
          {post.collection && (
            <Chip
              label={post.collection}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <CardMedia
          component="img"
          height="500"
          image={post.image}
          alt={post.caption}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setLiked(!liked)}>
              {liked ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton>
              <Comment />
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={() => setSaved(!saved)}>
              {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          </Box>

          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {post.likes} likes
          </Typography>

          <Typography variant="body1" gutterBottom>
            {post.caption}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {post.tags.map(tag => (
              <Typography
                key={tag}
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer' }}
              >
                #{tag}
              </Typography>
            ))}
          </Box>

          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {}}
          >
            View all {post.comments} comments
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ flex: 1, fontFamily: "'DM Serif Display', serif" }}>
          Style Inspiration
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowPostDialog(true)}
        >
          Share Your Look
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: "'DM Serif Display', serif" }}>
              Featured Collections
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['The Herat Bride Edit', 'Minimalist Wardrobe', 'Modern Fusion'].map(collection => (
                <Button
                  key={collection}
                  variant="outlined"
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {collection}
                </Button>
              ))}
            </Box>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: "'DM Serif Display', serif" }}>
              Trending Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['EidFashion', 'ModestWear', 'TraditionalWithATwist', 'StyleTips'].map(tag => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  onClick={() => {}}
                />
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={showPostDialog} onClose={() => setShowPostDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Look</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: 200, mb: 2 }}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.files[0] }))}
              />
            </Button>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Caption"
              value={newPost.caption}
              onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPostDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePostSubmit}
            disabled={!newPost.image || !newPost.caption}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunityFeed;
