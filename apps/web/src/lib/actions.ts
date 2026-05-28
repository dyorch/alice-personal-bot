'use server';

import { revalidatePath } from 'next/cache';

import type {
  CreateExpenseInput,
  CreateReminderInput,
  CreateWatchlistInput,
  UpdateWatchlistInput,
} from '@alice/shared';

import { api } from './api-client';

export async function createExpense(input: CreateExpenseInput) {
  const expense = await api.expenses.create(input);
  revalidatePath('/');
  revalidatePath('/gastos');
  return expense;
}

export async function deleteExpense(id: number) {
  await api.expenses.remove(id);
  revalidatePath('/');
  revalidatePath('/gastos');
}

export async function createReminder(input: CreateReminderInput) {
  const r = await api.reminders.create(input);
  revalidatePath('/');
  revalidatePath('/recordatorios');
  return r;
}

export async function deleteReminder(id: number) {
  await api.reminders.remove(id);
  revalidatePath('/');
  revalidatePath('/recordatorios');
}

export async function createWatchlist(input: CreateWatchlistInput) {
  const w = await api.watchlist.create(input);
  revalidatePath('/');
  revalidatePath('/watchlist');
  return w;
}

export async function updateWatchlist(id: number, input: UpdateWatchlistInput) {
  const w = await api.watchlist.update(id, input);
  revalidatePath('/');
  revalidatePath('/watchlist');
  return w;
}

export async function deleteWatchlist(id: number) {
  await api.watchlist.remove(id);
  revalidatePath('/');
  revalidatePath('/watchlist');
}
