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
import {
  Alert,
  Button,
  Card,
  Divider,
  FormLabel,
  Input,
  Slide,
  SlideProps,
  Snackbar,
  Stack,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField
} from "@mui/material";

Amplify.configure(outputs);
const client = generateClient<Schema>({
  authMode: "userPool",
});

function TodoList({ signOut, user }) {
  const schema = yup 
    .object()
    .shape({
      content: yup.string().required("Todo content is required"),
    })
    .required()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>({
    resolver: yupResolver(schema), 
  })
  
  const [todoLists, setTodo] = useState<Schema["Todo"]["type"][]>([]);

  const fetchTodos = async () => {
    const { data: items, errors } = await client.models.Todo.list({
      authMode: "userPool",
    });
    setTodo(items);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (data: Inputs) => {
    await client.models.Todo.create({
      content: data.content,
      isDone: false,
    },
    {
      authMode: 'userPool',
    }
  )
    fetchTodos();
    reset();
  }

  const deleteTodo = async (id: string) => {
    await client.models.Todo.delete({id});
    fetchTodos();
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
      <form onSubmit={handleSubmit(addTodo)}>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          {...register("content")}
          error={!!errors.content}
          helperText={errors.content?.message}
          placeholder="Enter new todo"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ mt: 2, mb: 2 }}
        >
          Add Todo
        </Button>
      </form>
      <List>
        {todoLists.map((todo) => (
          <ListItem
            key={todo.id}
            secondaryAction={
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => deleteTodo(todo.id)}
                size="small"
              >
                Delete
              </Button>
            }
          >
            <ListItemText primary={todo.content} />
          </ListItem>
        ))}
      </List>
      <Button variant="outlined" onClick={signOut} sx={{ mt: 2 }}>
        Sign Out
      </Button>
    </Box>
  );
}

export default function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Box display="flex" justifyContent="center">
          <Paper elevation={3} sx={{ padding: 3, width: '100%', maxWidth: 800, marginTop: 3 }}>
            <Typography variant="h4" gutterBottom>
              Todo List
            </Typography>
            <TodoList signOut={signOut} user={user} />
          </Paper>
        </Box>
      )}
    </Authenticator>
  );
}