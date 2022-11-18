import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Container, Wrapper, Spacer } from '@/components/Layout';
import { LoadingDots } from '@/components/LoadingDots';
import { Text, TextLink } from '@/components/Text';
import { fetcher } from '@/lib/fetch';
import { usePostPages } from '@/lib/post';
import { useCurrentUser } from '@/lib/user';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './Poster.module.css';

const PosterInner = ({ user }) => {
  const albumTitleRef = useRef();
  const albumArtistRef = useRef();
  const themeRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = usePostPages();

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        setIsLoading(true);
        await fetcher('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumTitle: albumTitleRef.current.value,
            albumArtist: albumArtistRef.current.value,
            theme: themeRef.current.value,
          }),
        });
        toast.success('You have posted successfully');
        albumTitleRef.current.value = '';
        albumArtistRef.current.value = '';
        themeRef.current.value = '';
        // refresh post lists
        mutate();
      } catch (e) {
        toast.error(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [mutate]
  );

  return (
    <form onSubmit={onSubmit}>
      <Container className={styles.poster}>
        <Avatar size={40} username={user.username} url={user.profilePicture} />
        <Input
          ref={albumTitleRef}
          className={styles.input}
          placeholder={`What album should we listen to?`}
          ariaLabel={`What album should we listen to?`}
        />
        <Spacer size={0.5} axis="vertical" />
        <Input
          ref={albumArtistRef}
          className={styles.input}
          placeholder={`And who was that by?`}
          ariaLabel={`And who was that by?`}
        />
        <Spacer size={0.5} axis="vertical" />
        <Input
          ref={themeRef}
          className={styles.input}
          placeholder={`What's the theme?`}
          ariaLabel={`What's the theme?`}
        />
        <Button type="success" loading={isLoading}>
          Post
        </Button>
      </Container>
    </form>
  );
};

const Poster = () => {
  const { data, error } = useCurrentUser();
  const loading = !data && !error;

  return (
    <Wrapper>
      <div className={styles.root}>
        <h3 className={styles.heading}>Post your album!</h3>
        {loading ? (
          <LoadingDots>Loading</LoadingDots>
        ) : data?.user ? (
          <PosterInner user={data.user} />
        ) : (
          <Text color="secondary">
            Please{' '}
            <Link href="/login" passHref legacyBehavior>
              <TextLink color="link" variant="highlight">
                sign in
              </TextLink>
            </Link>{' '}
            to post
          </Text>
        )}
      </div>
    </Wrapper>
  );
};

export default Poster;
