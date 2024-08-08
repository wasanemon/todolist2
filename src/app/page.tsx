'use client';


import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import Image from "next/image";
import styles from "./page.module.css";
import React from "react"
import {useState} from "react"
import { set, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"


type Inputs = {
  name: string
  age: string
  mail: string
}

const schema= yup 
  .object()
  .shape({
    name: yup.string().required(),
    age: yup.number().required(),
    mail: yup.string().required(),
  })
  .required()


export default function Home() {
  const { register, handleSubmit } = useForm<Inputs>({
    resolver: yupResolver(schema), 
  })

  const [input, setInput] = useState("");
  const [todoLists, setTodo] = useState([]);
  const addTodo = (e) => {
    e.preventDefault();
    setTodo([...todoLists, input]);
    setInput("");
  }
  const deleteTodo = (index) => {
    const newTodoLists = todoLists.filter((_,i) => i !== index);
    setTodo(newTodoLists);
  }

  return (
      <Authenticator>
      {({ signOut, user }) => (
        <main>
        <div>Hello world</div>
        <form onSubmit={addTodo}>
          <input 
            {...register("name")} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
          <button type="submit">追加</button>
        </form>
        <ul>
          {todoLists.map((item, index) => (
            <li key={index}>
              {item}
              <button onClick={()=>deleteTodo(index)}>消去</button>
            </li>
          ))}
        </ul>
      
      <button onClick={signOut}>Sign out</button>
      </main>
      )}
      </Authenticator>
  );
}
