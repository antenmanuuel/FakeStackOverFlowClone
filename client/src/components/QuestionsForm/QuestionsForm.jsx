import React, { useState } from "react";
import QuestionsPage from "../QuestionsPage/QuestionsPage";
import axios from "axios";
import { TextField, Button, Box, Typography, Container } from "@mui/material";

const QuestionsForm = (props) => {
  const [formData, setFormData] = useState({
    title: "",
    questionText: "",
    tags: "",
    username: "",
  });

  const [errors, setErrors] = useState({
    questionTitleError: "",
    questionTextError: "",
    tagsError: "",
    usernameError: "",
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    let titleError = "";
    let textError = "";
    let hyperlinkError = "";
    let tagsError = "";
    let usernameError = "";

    if (formData.title.length === 0 || formData.title.length > 100) {
      titleError = "Title should be between 1 and 100 characters.";
    }

    if (formData.questionText.trim() === "") {
      textError = "Question text cannot be empty.";
    }

    const allHyperLinks =
      formData.questionText.match(/\[[^\]]*\]\([^)]*\)/g) || [];
    const validHyperLinks =
      formData.questionText.match(/\[[^\]]*\]\((https?:\/\/[^)]*)\)/g) || [];

    if (allHyperLinks.length !== validHyperLinks.length) {
      for (let i = 0; i < allHyperLinks.length; i++) {
        const singleLinkPattern = /\[([^\]]*?)\]\(([^)]+)\)/;
        const match = allHyperLinks[i].match(singleLinkPattern);

        if (match) {
          if (!match[1].trim()) {
            hyperlinkError = "The name of the hyperlink cannot be empty.";
            break;
          }

          if (/\[.*\]/.test(match[1])) {
            hyperlinkError =
              "Link name should not contain nested square brackets.";
            break;
          }

          if (
            !match[2].startsWith("http://") &&
            !match[2].startsWith("https://")
          ) {
            hyperlinkError =
              "Hyperlink must begin with 'http://' or 'https://'.";
            break;
          }
        }
      }
    }

    const error = hyperlinkError ? hyperlinkError : textError;

    const tags = formData.tags.trim().toLowerCase().split(/\s+/);
    if (formData.tags.trim() === "") {
      tagsError = "Tags cannot be empty.";
    } else if (tags.length > 5) {
      tagsError = "There can be at most 5 tags.";
    } else if (tags.some((tag) => tag.length > 10)) {
      tagsError = "Each tag should be 10 characters or less.";
    }

    if (formData.username.trim() === "") {
      usernameError = "Username cannot be empty.";
    }

    setErrors({
      questionTitleError: titleError,
      questionTextError: error,
      tagsError: tagsError,
      usernameError: usernameError,
    });

    if (!titleError && !error && !tagsError && !usernameError) {
      const newQuestion = {
        title: formData.title,
        text: formData.questionText,
        tagIds: tags,
        askedBy: formData.username,
        views: 0,
      };

      try {
        await axios.post(
          "http://localhost:8000/posts/questions/askQuestion",
          newQuestion
        );
        if (props.onQuestionAdded) {
          props.onQuestionAdded();
        }
        setFormData({
          title: "",
          questionText: "",
          tags: "",
          username: "",
        });
        setIsFormSubmitted(true);
      } catch (error) {
        console.error("Error submitting the question:", error);
      }
    }
  };

  if (isFormSubmitted) {
    return <QuestionsPage />;
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
        }}
      >
        <form onSubmit={handleFormSubmit} noValidate>
          <Typography variant="h6" gutterBottom>
            Question Title*
          </Typography>
          <TextField
            required
            fullWidth
            id="questionTitleBox"
            name="title"
            label="Limit title to 100 characters or less"
            value={formData.title}
            onChange={handleInputChange}
            error={Boolean(errors.questionTitleError)}
            helperText={errors.questionTitleError}
          />
          <Typography variant="h6" gutterBottom>
            Question Text*
          </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            id="questionTextBox"
            label="Add details"
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            error={Boolean(errors.questionTextError)}
            helperText={errors.questionTextError}
          />
          <Typography variant="h6" gutterBottom>
            Tags*
          </Typography>
          <TextField
            required
            fullWidth
            id="tagsTextBox"
            name="tags"
            label="Add keywords separated by whitespace"
            value={formData.tags}
            onChange={handleInputChange}
            error={Boolean(errors.tagsError)}
            helperText={errors.tagsError}
          />
          <Typography variant="h6" gutterBottom>
            Username*
          </Typography>
          <TextField
            required
            fullWidth
            id="usernameTextBox"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            error={Boolean(errors.usernameError)}
            helperText={errors.usernameError}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, padding:"10px" }}
          >
            Submit Question
          </Button>
          <Typography variant="body2" color="red" align="right" fontSize={25}>
            *Indicates mandatory fields
          </Typography>
        </form>
      </Box>
    </Container>
  );
};

export default QuestionsForm;