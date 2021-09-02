import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Button, cssVariables, shadow, Icon, IconButton } from 'feather';

import { FormInput } from '@ui/components';

const DragTargetIcon = styled(Icon)`
  position: absolute;
  left: -32px;
  top: 18px;
`;

const RemoveIconButton = styled(IconButton)`
  margin-left: 8px;
  cursor: pointer;
`;

const DropZone = styled.div`
  margin-top: 8px;
`;

const DraggableArea = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const getItemStyle = (_, draggableStyle) => ({
  userSelect: 'none',
  outline: 'none',
  ...draggableStyle,
});

const getInputStyle = (isDragging) => {
  return {
    FORM_SET: css`
      width: 100%;
    `,
    INPUT_TEXT: css`
      ${isDragging &&
      css`
        ${shadow[8]};
      `}
    `,
  };
};

interface OwnProps {
  options: CustomFieldDropdownValue;

  addOption: (event: React.MouseEvent<HTMLButtonElement>) => void;
  changeOptionField: (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeOption: (index: number) => () => void;
  reorderOptions: (index: { startIndex: number; endIndex: number }) => void;
}

type Props = OwnProps;

export const DragContainer: React.FC<Props> = ({
  options: { order, fields },
  addOption,
  changeOptionField,
  removeOption,
  reorderOptions,
}) => {
  const intl = useIntl();
  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    reorderOptions({ startIndex: result.source.index, endIndex: result.destination.index });
  };
  const showIcons = order.length > 1;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <DropZone {...provided.droppableProps} ref={provided.innerRef}>
            {order.map((id, index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(provided, snapshot) => (
                  <DraggableArea
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    {showIcons && <DragTargetIcon icon="drag-handle" size={20} color={cssVariables('neutral-6')} />}
                    <FormInput
                      tabIndex={-1}
                      type="text"
                      onChange={changeOptionField(id)}
                      error={fields[id].error}
                      value={fields[id].value}
                      styles={getInputStyle(snapshot.isDragging)}
                      data-test-id={`CustomFieldDropdownOption-${order}`}
                    />

                    {showIcons && (
                      <RemoveIconButton
                        icon="close"
                        iconSize={20}
                        color={cssVariables('neutral-6')}
                        onClick={removeOption(index)}
                      />
                    )}
                  </DraggableArea>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </DropZone>
        )}
      </Droppable>
      <Button variant="ghost" buttonType="primary" onClick={addOption} icon={<Icon icon="plus" size={20} />}>
        {intl.formatMessage({ id: 'desk.customFields.detail.field.addOption.button' })}
      </Button>
    </DragDropContext>
  );
};
