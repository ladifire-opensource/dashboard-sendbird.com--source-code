import { useEffect, FC, useState, useRef, useCallback } from 'react';

import { SearchSelectionDropdown, toast } from 'feather';

import { fetchAnnouncementGroups } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';
import { PropsOf } from '@utils';

type Props = Pick<
  PropsOf<typeof SearchSelectionDropdown>,
  'placeholder' | 'label' | 'onChange' | 'initialSelectedItem'
>;

export const AnnouncementGroupSearchDropdown: FC<Props> = ({ placeholder, label, onChange, initialSelectedItem }) => {
  const appId = useAppId();
  const [announcementGroups, setAnnouncementGroups] = useState<string[]>([]);
  const nextToken = useRef<string | null>(null);
  const ongoingRequest = useRef<ReturnType<FetchAnnouncementGroupsAPI> | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver>();

  useEffect(() => {
    nextToken.current = null;
  }, [appId]);

  const loadAnnounncementGroups = useCallback(
    async (isInitial: boolean) => {
      const token = nextToken.current ?? undefined;

      if (ongoingRequest.current || (!isInitial && !token)) {
        // avoid duplicated or invalid requests.
        return;
      }

      try {
        ongoingRequest.current = fetchAnnouncementGroups({ appId, limit: 100, token });

        const {
          data: { announcement_groups, next },
        } = await ongoingRequest.current;

        setAnnouncementGroups((currentValue) =>
          token ? currentValue.concat(announcement_groups) : announcement_groups,
        );
        nextToken.current = next;
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      } finally {
        ongoingRequest.current = null;
      }
    },
    [appId],
  );

  useEffect(() => {
    loadAnnounncementGroups(true);
  }, [loadAnnounncementGroups]);

  const observerItemRefCallback = (observerItem: HTMLElement | null) => {
    if (observerItem == null || !nextToken.current) {
      // cannot find the node or no need to attach an intersection observer.
      intersectionObserverRef.current?.disconnect();
      intersectionObserverRef.current = undefined;
      return;
    }

    // disconnect previous intersection observer instance.
    intersectionObserverRef.current?.disconnect();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadAnnounncementGroups(false);
        }
      },
      { root: observerItem?.closest('ul[role="listbox"]') },
    );
    intersectionObserverRef.current = intersectionObserver;
    intersectionObserver.observe(observerItem);
  };

  return (
    <SearchSelectionDropdown
      placeholder={placeholder}
      label={label}
      items={announcementGroups}
      initialSelectedItem={initialSelectedItem}
      isCreatable={true}
      disableNoResultsView={true}
      onChange={onChange}
      itemToElement={(item) => (
        <div
          ref={(node) => {
            const isIntersectionObserverTarget = node?.closest('[role="option"]')?.matches(':nth-last-child(3)');
            isIntersectionObserverTarget && observerItemRefCallback(node);
          }}
        >
          {item}
        </div>
      )}
    />
  );
};
