import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlParams } from '../useUrlParams';

describe('useUrlParams', () => {
	const originalLocation = window.location;
	const originalHistory = window.history;

	beforeEach(() => {
		// Mock window.location
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '',
				pathname: '/',
			},
			writable: true,
		});

		// Mock history methods
		window.history.replaceState = vi.fn();
		window.history.pushState = vi.fn();
	});

	afterEach(() => {
		Object.defineProperty(window, 'location', {
			value: originalLocation,
			writable: true,
		});
	});

	it('should initialize with empty params when no URL params exist', () => {
		const { result } = renderHook(() => useUrlParams());

		expect(result.current.params).toEqual({});
	});

	it('should parse existing URL params on mount', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?club=Cubbies&clubber=123',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		expect(result.current.params).toEqual({
			club: 'Cubbies',
			clubber: '123',
		});
	});

	it('should update params with replaceState by default', () => {
		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ club: 'Sparks' });
		});

		expect(window.history.replaceState).toHaveBeenCalled();
		expect(result.current.params).toEqual({ club: 'Sparks' });
	});

	it('should update params with pushState when replace is false', () => {
		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ club: 'T&T' }, false);
		});

		expect(window.history.pushState).toHaveBeenCalled();
	});

	it('should delete params when value is empty string', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?club=Cubbies&clubber=123',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ clubber: '' });
		});

		expect(result.current.params.clubber).toBeUndefined();
	});

	it('should delete params when value is null', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?club=Cubbies',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ club: null as unknown as string });
		});

		expect(result.current.params.club).toBeUndefined();
	});

	it('should delete params when value is undefined', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?club=Cubbies',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ club: undefined as unknown as string });
		});

		expect(result.current.params.club).toBeUndefined();
	});

	it('should handle multiple params update', () => {
		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({
				club: 'Cubbies',
				clubber: '456',
				reports: 'true',
			});
		});

		expect(result.current.params).toEqual({
			club: 'Cubbies',
			clubber: '456',
			reports: 'true',
		});
	});

	it('should preserve existing params when updating new ones', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?existing=value',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		act(() => {
			result.current.updateParams({ newParam: 'newValue' });
		});

		expect(result.current.params.existing).toBe('value');
		expect(result.current.params.newParam).toBe('newValue');
	});

	it('should handle special characters in param values', () => {
		Object.defineProperty(window, 'location', {
			value: {
				...originalLocation,
				search: '?name=T%26T',
				pathname: '/',
			},
			writable: true,
		});

		const { result } = renderHook(() => useUrlParams());

		expect(result.current.params.name).toBe('T&T');
	});
});
