// @ts-nocheck

'use client';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import Image from "next/image";
import styles from "./page.module.css";
import React from "react"
import { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Amplify, Logger } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

Amplify.configure(outputs);
const client = generateClient<Schema>({
  authMode: "userPool",
});

export default function Home() {
  
  const schema= yup 
    .object()
    .shape({
      content: yup.string().required(),
    })
    .required()
  
  const { register, handleSubmit, reset} = useForm<Inputs>({
    resolver: yupResolver(schema), 
  })
  
  const [todoLists, setTodo] = useState<Schema["Todo"]["type"][]>([]);

  const fetchTodos = async (username: string) => {
    const { data: items } = await client.models.Todo.list({
      authMode: "userPool",
      filter: {
        owner: {
          eq: username
        }
      }
    });
    setTodo([...items]);
  };

  const addTodo = async (data: Inputs, username: string) => {
    await client.models.Todo.create({
      content: data.content,
      isDone: false,
      owner: username
    },
    {
      authMode: 'userPool',
    });
    fetchTodos(username);
    reset();
  }

  const deleteTodo = async (id: string, username: string) => {
    await client.models.Todo.delete({id});
    fetchTodos(username);
  }

  return (
    <Authenticator>
      {({ signOut, user }) => {
        useEffect(() => {
          if (user) {
            fetchTodos(user.username);
          }
        }, [user]);

        return (
          <main>
            <div>Hello {user?.username}</div>
            <form onSubmit={handleSubmit((data) => addTodo(data, user.username))}>
              <input 
                {...register("content")} 
              />
              <button type="submit">追加</button>
            </form>
            <ul>
              {todoLists.map((todo) => (
                <li key={todo.id}>
                  {todo.content}
                  <button onClick={() => deleteTodo(todo.id, user.username)}>消去</button>
                </li>
              ))}
            </ul>
          
            <button onClick={signOut}>Sign out</button>
          </main>
        )
      }}
    </Authenticator>
  );
}