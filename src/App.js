import React, { useState } from 'react';
import { Configuration } from 'openai'
import './App.css'

const PARAMS = {
  temperature: 0.5,
  max_tokens: 256
}

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_KEY,
  dangerouslyAllowBrowser: true
})

const App = () => {
  const [questionType, setQuestionType] = useState('general')
  const [cbResponse, setCbResponse] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [storyType, setStoryType] = useState('fantasy') // Par défaut, le type d'histoire est fantasy
  const [generatedStory, setGeneratedStory] = useState('')

  const getInstructions = (qt, input) => {
    let prompt;
    switch (qt) {
      case 'general':
        prompt = input;
        break;
      case 'translate':
        prompt = `translate this text to spanish: ${input}`;
        break;
      case 'weather':
        prompt = `if the question is related to weather - answer it: ${input}, else say: Can't answer this`;
        break;
      default:
        prompt = input;
    }
    return prompt;
  }

  const generateStory = async () => {
    setIsLoading(true); // Activer le chargement pendant la génération de l'histoire
    const theme = storyType === 'fantasy' ? 'histoire de fantasy' :
      storyType === 'scifi' ? 'histoire de science-fiction' :
        storyType === 'thriller' ? 'histoire de thriller' : 'histoire';
    const prompt = `Écris une histoire sur le thème ${theme} en français de 256 mots.`;

    const endpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";
    const body = { ...PARAMS, prompt };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${configuration.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    setGeneratedStory(data.choices[0].text);
    setIsLoading(false);
  }

  const handleSendData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const prompt = getInstructions(questionType, userInput);
    const endpoint = "https://api.openai.com/v1/engines/text-davinci-003/completions";
    const body = { ...PARAMS, prompt };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${configuration.apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    setCbResponse(data.choices[0].text);
    setIsLoading(false);
  }

  return (
    <div>
      <h1>
        {['general', 'translate', 'weather'].map(el => {
          return (
            <p key={el}>
              <button variant="primary" onClick={() => setQuestionType(el)}>{el}</button>
            </p>
          )
        })}
      </h1>
      <h3>
        Question type: <b>{questionType}</b>
      </h3>
      <form onSubmit={handleSendData}>
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Entrez votre texte ici"
        />
        <button type="submit">Soumettre</button>
      </form>
      <div>
        {isLoading ?
          <div className='spinner'></div>
          :
          cbResponse ? cbResponse : 'no question asked'
        }
      </div>
      <div>
        <h3>Type d'histoire : {storyType}</h3>
        <button onClick={() => setStoryType('fantasy')}>Fantasy</button>
        <button onClick={() => setStoryType('scifi')}>Science-Fiction</button>
        <button onClick={() => setStoryType('thriller')}>Thriller</button>
        <button onClick={generateStory}>Histoires</button>
        <div>
          {isLoading ?
            <div className='spinner'></div>
            :
            generatedStory ? generatedStory : 'Pas d\'histoire générée'
          }
        </div>
      </div>
    </div >
  );
};

export default App;
