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
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

Amplify.configure(outputs);
const client = generateClient<Schema>()


type Inputs = {
  content: string
}

const schema= yup 
  .object()
  .shape({
    content: yup.string().required(),
  })
  .required()


export default function Home() {
  const { register, handleSubmit, reset} = useForm<Inputs>({
    resolver: yupResolver(schema), 
  })
  
  const [todoLists, setTodo] = useState<Schema["Todo"]["type"][]>([]);

  const fetchTodos = async () => {
    const { data: items, errors } = await client.models.Todo.list();
    setTodo(items);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (data: Inputs) => {
    await client.models.Todo.create({
      content: data.content,
      isDone: false,
    })
    fetchTodos();
    reset();
  }
  const deleteTodo = async (id: string) => {
    await client.models.Todo.delete({id});
    fetchTodos();
  }

  return (
      <Authenticator>
      {({ signOut, user }) => (
        <main>
        <div>Hello world</div>
        <form onSubmit={handleSubmit(addTodo)}>
          <input 
            {...register("content")} 
          />
          <button type="submit">追加</button>
        </form>
        <ul>
        {todoLists.map(({ id, content }) => (
          <li key={id}>{content}<button onClick={()=>deleteTodo(id)}>消去</button></li>
        ))}
        </ul>
      
      <button onClick={signOut}>Sign out</button>
      </main>
      )}
      </Authenticator>
  );
}
