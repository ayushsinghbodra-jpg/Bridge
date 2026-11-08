import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';
import Card from './Card';
import Modal from './Modal';

describe('UI Components', () => {
  describe('Input', () => {
    it('should render input with value and placeholder', () => {
      render(<Input placeholder="Enter username" value="test_value" onChange={() => {}} />);
      const input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('test_value');
    });

    it('should trigger onChange callback when user types', () => {
      const handleChange = jest.fn();
      render(<Input placeholder="Type here" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Type here');
      fireEvent.change(input, { target: { value: 'typed_content' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should respect disabled attribute', () => {
      render(<Input placeholder="Disabled input" disabled />);
      expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('should render card children and apply custom className', () => {
      render(
        <Card className="custom-test-card">
          <p>Card Content</p>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('should return null and not render when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Hidden Modal Content</div>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText('Hidden Modal Content')).not.toBeInTheDocument();
    });

    it('should render modal dialog and trigger onClose on close button or backdrop click', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Visible Content</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Visible Content')).toBeInTheDocument();

      // Click close button
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
