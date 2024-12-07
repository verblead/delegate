'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Choice {
  id: string
  text: string
  isCorrect: boolean
}

interface MultipleChoiceProps {
  question: string
  choices: Choice[]
  onAnswer: (correct: boolean) => void
}

export function MultipleChoice({ question, choices, onAnswer }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string>('')
  const [answered, setAnswered] = useState(false)

  const handleSubmit = () => {
    const isCorrect = choices.find(c => c.id === selected)?.isCorrect || false
    setAnswered(true)
    onAnswer(isCorrect)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          disabled={answered}
        >
          {choices.map((choice) => (
            <div key={choice.id} className="flex items-center space-x-2">
              <RadioGroupItem value={choice.id} id={choice.id} />
              <Label htmlFor={choice.id}>{choice.text}</Label>
              {answered && (
                <span className={choice.isCorrect ? 'text-green-500' : 'text-red-500'}>
                  {choice.isCorrect ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </RadioGroup>
        <Button 
          onClick={handleSubmit} 
          disabled={!selected || answered}
          className="mt-4"
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  )
} 