'use client';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

Amplify.configure(outputs);
const client = generateClient<Schema>()

type Inputs = {
  content: string
}

const schema = yup 
  .object()
  .shape({
    content: yup.string().required(),
  })
  .required()

export default function Home() {
  const { register, handleSubmit, reset } = useForm<Inputs>({
    resolver: yupResolver(schema), 
  })
  
  const [todoLists, setTodo] = useState<Schema["Todo"]["type"][]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos...');
      const { data: items, errors } = await client.models.Todo.list();
      if (errors) {
        console.error('Errors returned from API:', errors);
        setError('エラーが発生しました。詳細はコンソールを確認してください。');
        return;
      }
      console.log('Todos fetched successfully:', items);
      setTodo(items);
      setError(null);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Todoリストの取得中にエラーが発生しました。');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (data: Inputs) => {
    try {
      console.log('Adding new todo:', data.content);
      const result = await client.models.Todo.create({
        content: data.content,
        isDone: false,
      });
      console.log('Todo added successfully:', result);
      fetchTodos();
      reset();
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Todoの追加中にエラーが発生しました。');
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      console.log('Deleting todo:', id);
      await client.models.Todo.delete({ id });
      console.log('Todo deleted successfully');
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Todoの削除中にエラーが発生しました。');
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <div>Hello {user?.username}</div>
          {error && <div style={{color: 'red'}}>{error}</div>}
          <form onSubmit={handleSubmit(addTodo)}>
            <input 
              {...register("content")} 
              placeholder="Enter todo item"
            />
            <button type="submit">追加</button>
          </form>
          <ul>
            {todoLists.map(({ id, content }) => (
              <li key={id}>{content}<button onClick={() => deleteTodo(id)}>消去</button></li>
            ))}
          </ul>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}