import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { Dropdown, DropdownProps, cssVariables, Subtitles, Button, toast } from 'feather';

import { commonActions } from '@actions';
import { axios, getDashboardAPIUrl } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { getErrorMessage } from '@epics';
import { useQueryString } from '@hooks/useQueryString';

type BrancherItem = {
  key: string;
  branch: string;
};

const BrancherToggle = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  padding: 0 16px;
`;

const EmptyView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  color: ${cssVariables('neutral-7')};
  ${Subtitles['subtitle-01']}
`;

export const Brancher = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const dispatch = useDispatch();
  const { branch: branchQuery } = useQueryString<{ branch: string }>({ branch: '' });
  const currentBranch = window.cookies.get('sbStagingBranch') || '';

  useEffect(() => {
    axios
      .get(`${getDashboardAPIUrl()}/api/brancher`)
      .then((res) => setBranches(res.data))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    if (branchQuery === currentBranch) return;
    if (branches.includes(branchQuery)) {
      window.cookies.set('sbStagingBranch', branchQuery, {
        expires: new Date('2100-01-01'),
        path: '/',
      });
      location.reload();
    } else if (currentBranch) {
      history.pushState({}, '', `${location.pathname}?branch=${currentBranch}`);
    } else {
      history.pushState({}, '', location.pathname);
    }
  }, [branchQuery, branches, currentBranch]);

  const handleDropdownChange: DropdownProps<BrancherItem>['onChange'] = (item) => {
    if (item == null) {
      return;
    }
    if (item.key === 'clear') {
      // how to delete cookie - https://github.com/reactivestack/cookies/issues/238
      window.cookies.remove('sbStagingBranch', {
        path: '/',
      });
      location.replace('/settings/ff');
    } else {
      window.cookies.set('sbStagingBranch', item.branch, {
        expires: new Date('2100-01-01'),
        path: '/',
      });
      location.replace(`${location.pathname}?branch=${item.branch}`);
    }
  };

  const handleDeleteBranchClick: React.MouseEventHandler = () => {
    if (currentBranch) {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.Confirm,
          dialogProps: {
            description: 'Are you sure to delete this branch from the list?',
            onConfirm: () => {
              axios
                .delete(`${getDashboardAPIUrl()}/api/brancher`, {
                  data: {
                    branch: currentBranch,
                  },
                })
                .then(() => {
                  window.cookies.remove('sbStagingBranch', {
                    path: '/',
                  });
                  location.replace('/settings/ff');
                })
                .catch((error) => {
                  toast.error({
                    message: getErrorMessage(error),
                  });
                });
            },
          },
        }),
      );
      return;
    }
    toast.warning({
      message: 'There is no selected branch.',
    });
  };

  const branchItems = branches.map((branch) => ({
    key: branch,
    branch,
  }));

  const items: DropdownProps<BrancherItem>['items'] = [
    {
      items: branchItems,
    },
    {
      items: [{ key: 'clear', branch: 'Reset to default' }],
    },
  ];

  return (
    <>
      <Dropdown<BrancherItem>
        toggleRenderer={({ selectedItem }) => (
          <BrancherToggle>{selectedItem ? selectedItem.branch : 'Default'}</BrancherToggle>
        )}
        selectedItem={branchItems.find((item) => item.branch === currentBranch)}
        itemToElement={(item) => item.branch}
        items={branchItems.length > 0 ? items : []}
        itemsType="section"
        emptyView={<EmptyView>There is no active branch</EmptyView>}
        onChange={handleDropdownChange}
        width="100%"
      />
      <br />
      <Button buttonType="tertiary" icon="remove" onClick={handleDeleteBranchClick}>
        Delete selected branch
      </Button>
    </>
  );
};
