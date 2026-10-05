function canDeleteStory(story) {
  return Boolean(story && !story.sample && firebaseState.user?.uid && story.userId === firebaseState.user.uid);
}

function createStoryCard(story) {
  const article = document.createElement('article');
  article.className = 'traveler-story-card';
  article.dataset.storyId = story.id;

  const meta = document.createElement('div');
  meta.className = 'traveler-story-meta';
  const label = document.createElement('span');
  label.className = story.sample ? 'story-sample-label' : 'story-sample-label';
  label.textContent = story.sample ? 'Sample story' : 'Traveler story';
  const place = document.createElement('span');
  place.textContent = story.location || story.country || 'Jordan';
  meta.append(label, place);

  if (story.image) {
    const image = document.createElement('img');
    image.className = 'traveler-story-image';
    image.src = story.image;
    image.alt = `Photo shared with ${story.title || 'this traveler story'}`;
    image.loading = 'lazy';
    article.appendChild(image);
  }

  const title = document.createElement('h3');
  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'story-open-button';
  openButton.dataset.storyOpen = story.id;
  title.textContent = story.title || 'Travel Story';

  const content = document.createElement('p');
  content.className = 'traveler-story-excerpt';
  content.textContent = story.content || '';
  const readMore = document.createElement('span');
  readMore.className = 'story-read-more';
  readMore.textContent = 'Read full story';
  openButton.append(title, content, readMore);

  const footer = document.createElement('footer');
  const author = document.createElement('span');
  author.textContent = story.author || 'Traveler';
  const country = document.createElement('span');
  country.textContent = story.country || 'Jordan';
  footer.append(author, country);

  const engagement = storyEngagement[story.id] || { liked: false };
  const actions = document.createElement('div');
  actions.className = 'story-card-actions';
  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'story-like-button';
  likeButton.dataset.storyLike = story.id;
  likeButton.setAttribute('aria-pressed', String(Boolean(engagement.liked)));
  likeButton.append(document.createTextNode('♥ '));
  const likeCount = document.createElement('span');
  likeCount.textContent = Number(story.likes || 0) + (engagement.liked ? 1 : 0);
  likeButton.appendChild(likeCount);
  actions.appendChild(likeButton);
  if (canDeleteStory(story)) {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'story-delete-button';
    deleteButton.dataset.storyDelete = story.id;
    deleteButton.setAttribute('aria-label', `Delete your story: ${story.title || 'Travel story'}`);
    deleteButton.textContent = 'Delete';
    actions.appendChild(deleteButton);
  }

  article.append(meta, openButton, footer, actions);
  return article;
}

function renderTravelerStories(stories = travelerStories) {
  const container = document.getElementById('traveler-stories-list');
  if (!container) return;
  container.replaceChildren(...stories.map(createStoryCard));
}

async function loadStoriesFromFirestore() {
  if (!firebaseState.db) {
    travelerStories = [...DEFAULT_TRAVELER_STORIES];
    renderTravelerStories();
    return;
  }

  try {
    const storiesRef = firebaseState.db.collection('stories');

    const snapshot = await storiesRef
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const remoteStories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      sample: false
    }));

    /*
     * Keep the built-in Darbak sample stories
     * AND add the stories published through Firebase.
     *
     * Firebase is still the source of truth for
     * user-published stories.
     */
    travelerStories = [
      ...remoteStories,
      ...DEFAULT_TRAVELER_STORIES
    ];

    /*
     * Keep localStorage synchronized with Firebase.
     * We do NOT use localStorage to restore stories.
     */
    writeLocalData('darbak-stories', remoteStories);

    renderTravelerStories();

  } catch (error) {
    console.warn(
      'Unable to load traveler stories from Firebase:',
      error
    );

    /*
     * If Firebase cannot be reached, show only
     * the built-in sample stories rather than
     * potentially stale local stories.
     */
    travelerStories = [...DEFAULT_TRAVELER_STORIES];

    renderTravelerStories();
  }
}

async function deleteTravelerStory(storyId) {
  const story = travelerStories.find(item => item.id === storyId);
  if (!story || story.sample) return;
  if (!firebaseState.user || story.userId !== firebaseState.user.uid) {
    showToast('You can only delete stories you published.', 'error');
    return;
  }
  if (!window.confirm(`Delete “${story.title || 'this story'}”? This cannot be undone.`)) return;

  try {
    await firebaseState.db.collection('stories').doc(storyId).delete();
    travelerStories = travelerStories.filter(item => item.id !== storyId);
    delete storyEngagement[storyId];
    writeLocalData('darbak-stories', travelerStories);
    writeLocalData('darbak-story-engagement', storyEngagement);
    renderTravelerStories();
    if (activeStoryId === storyId) closeModal('story-modal');
    showToast('Your story was deleted.', 'success');
  } catch (error) {
    showToast(getFriendlyErrorMessage(error, 'Your story could not be deleted. Please try again.'), 'error');
  }
}

function openTravelerStory(storyId) {
  const story = travelerStories.find(item => item.id === storyId);
  const modal = document.getElementById('story-modal');
  if (!story || !modal) return;
  activeStoryId = storyId;
  const image = document.getElementById('story-detail-image');
  image.hidden = !story.image;
  if (story.image) image.src = story.image;
  document.getElementById('story-detail-title').textContent = story.title || 'Traveler story';
  document.getElementById('story-detail-location').textContent = story.location || story.country || 'Jordan';
  document.getElementById('story-detail-date').textContent = story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Sample story';
  document.getElementById('story-detail-author').textContent = `${story.author || 'Traveler'} · ${story.country || 'Jordan'}`;
  document.getElementById('story-detail-content').textContent = story.content || '';
  const engagement = storyEngagement[storyId] || { liked: false };
  const likeButton = document.getElementById('story-detail-like');
  const deleteButton = document.getElementById('story-detail-delete');
  deleteButton.hidden = !canDeleteStory(story);
  likeButton.textContent = `${engagement.liked ? '♥ Liked' : '♡ Like'} · ${Number(story.likes || 0) + (engagement.liked ? 1 : 0)}`;
  likeButton.setAttribute('aria-pressed', String(Boolean(engagement.liked)));
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.querySelector('.modal-close')?.focus();
}

function toggleTravelerStoryLike(storyId) {
  const engagement = storyEngagement[storyId] || { liked: false };
  engagement.liked = !engagement.liked;
  storyEngagement[storyId] = engagement;
  writeLocalData('darbak-story-engagement', storyEngagement);
  renderTravelerStories();
  if (activeStoryId === storyId) openTravelerStory(storyId);
}

function readStoryPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
    if (file.size > 1024 * 1024) return reject(new Error('Choose a photo smaller than 1 MB.'));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.readAsDataURL(file);
  });
}

function setupStoryInteractions() {
  const container = document.getElementById('traveler-stories-list');
  container?.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-story-delete]');
    if (deleteButton) {
      deleteTravelerStory(deleteButton.dataset.storyDelete);
      return;
    }
    const likeButton = event.target.closest('[data-story-like]');
    if (likeButton) {
      toggleTravelerStoryLike(likeButton.dataset.storyLike);
      return;
    }
    const openButton = event.target.closest('[data-story-open]');
    if (openButton) {
      openTravelerStory(openButton.dataset.storyOpen);
      return;
    }
    const card = event.target.closest('.traveler-story-card[data-story-id]');
    if (card && !event.target.closest('button, a')) openTravelerStory(card.dataset.storyId);
  });

  document.getElementById('story-detail-like')?.addEventListener('click', () => {
    if (activeStoryId) toggleTravelerStoryLike(activeStoryId);
  });
  document.getElementById('story-detail-delete')?.addEventListener('click', () => {
    if (activeStoryId) deleteTravelerStory(activeStoryId);
  });
  document.getElementById('story-photo')?.addEventListener('change', async event => {
    const preview = document.getElementById('story-photo-preview');
    try {
      storyPhotoDataUrl = await readStoryPhoto(event.target.files[0]);
      if (preview) {
        preview.hidden = !storyPhotoDataUrl;
        if (storyPhotoDataUrl) preview.querySelector('img').src = storyPhotoDataUrl;
      }
    } catch (error) {
      storyPhotoDataUrl = '';
      event.target.value = '';
      if (preview) preview.hidden = true;
      showToast(error.message, 'error');
    }
  });
  document.getElementById('remove-story-photo')?.addEventListener('click', () => {
    storyPhotoDataUrl = '';
    document.getElementById('story-photo').value = '';
    document.getElementById('story-photo-preview').hidden = true;
  });
}

