import { useCallback, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { toast } from '@/components/providers/Toaster';

/**
 * useUserImage — the current user's profile picture (or `null`).
 *
 * Returns:
 *   - `imageUrl`     — the fresh signed URL for the stored avatar,
 *                      or `null` when the user hasn't set one (or
 *                      while the query is still resolving on first
 *                      load). Components should fall back to the
 *                      initials avatar in that case.
 *   - `isUploading`  — `true` while a file is being POSTed to the
 *                      upload URL. Components disable controls and
 *                      show a spinner during this window.
 *   - `upload(file)` — picks a file, validates it, uploads it, then
 *                      patches the userPreferences doc to point at
 *                      the new blob. Surfaces a toast on success /
 *                      failure. Throws on validation failure so
 *                      callers can react (we already toast though).
 *   - `remove()`     — clears the avatar + deletes the stored blob.
 *
 * All mutations go through the user's `userPreferences` doc — there
 * is no separate avatar table.
 */

// Soft client-side cap. Convex can store much larger files but
// avatars > 4MB are almost always a mistake (raw camera photo) and
// the round-trip gets slow.
const MAX_BYTES = 4 * 1024 * 1024;

export function useUserImage() {
  const imageUrl = useQuery(api.userImage.getMyImageUrl) as string | null | undefined;
  const generateUploadUrl = useMutation(api.userImage.generateUploadUrl);
  const setMyImage = useMutation(api.userImage.setMyImage);
  const removeMyImage = useMutation(api.userImage.removeMyImage);

  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please pick an image file');
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`Image too large (max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB)`);
        return;
      }

      setIsUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!result.ok) throw new Error('Upload failed');
        const { storageId } = (await result.json()) as { storageId: string };
        await setMyImage({ storageId: storageId as never });
        toast.success('Profile photo updated');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, setMyImage],
  );

  const remove = useCallback(async () => {
    try {
      await removeMyImage();
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove photo');
      throw err;
    }
  }, [removeMyImage]);

  return {
    imageUrl: imageUrl ?? null,
    isLoading: imageUrl === undefined,
    isUploading,
    upload,
    remove,
  } as const;
}
