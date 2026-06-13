// Profile Prompts - Malawian-Specific
export const PROFILE_PROMPTS = [
    // Personality & Lifestyle
    {
        id: 'heart_key',
        category: 'personality',
        question: 'The key to my heart is...',
        placeholder: 'e.g., good music and deep conversations',
        icon: '❤️'
    },
    {
        id: 'perfect_sunday',
        category: 'lifestyle',
        question: 'My perfect Sunday looks like...',
        placeholder: 'e.g., church, family lunch, and Netflix',
        icon: '☀️'
    },
    {
        id: 'unusual_skill',
        category: 'personality',
        question: 'An unusual skill I have is...',
        placeholder: 'e.g., I can cook nsima blindfolded',
        icon: '✨'
    },

    // Malawian-Specific
    {
        id: 'favorite_dish',
        category: 'malawian',
        question: 'My favorite Malawian dish is...',
        placeholder: 'e.g., chambo with nsima and ndiwo',
        icon: '🍽️'
    },
    {
        id: 'best_place_malawi',
        category: 'malawian',
        question: 'Best place in Malawi is...',
        placeholder: 'e.g., Zomba Plateau at sunset',
        icon: '🇲🇼'
    },
    {
        id: 'malawian_pride',
        category: 'malawian',
        question: 'What makes me proud to be Malawian...',
        placeholder: 'e.g., our warm hearts and resilience',
        icon: '💚'
    },

    // Dating & Relationships
    {
        id: 'looking_for',
        category: 'dating',
        question: "I'm looking for someone who...",
        placeholder: 'e.g., values family and has ambition',
        icon: '💑'
    },
    {
        id: 'first_date',
        category: 'dating',
        question: 'My ideal first date would be...',
        placeholder: 'e.g., coffee at Sunbird, then a walk',
        icon: '☕'
    },
    {
        id: 'deal_breaker',
        category: 'dating',
        question: 'A deal-breaker for me is...',
        placeholder: 'e.g., dishonesty or lack of ambition',
        icon: '🚫'
    },

    // Interests & Hobbies
    {
        id: 'weekend_vibe',
        category: 'interests',
        question: 'On weekends, you\'ll find me...',
        placeholder: 'e.g., at the gym or exploring new cafes',
        icon: '🎉'
    },
    {
        id: 'music_taste',
        category: 'interests',
        question: 'My music taste is...',
        placeholder: 'e.g., Afrobeats, gospel, and a bit of jazz',
        icon: '🎵'
    },
    {
        id: 'hidden_talent',
        category: 'interests',
        question: 'A hidden talent of mine is...',
        placeholder: 'e.g., I can dance traditional Malawian dances',
        icon: '💃'
    },

    // Values & Goals
    {
        id: 'life_goal',
        category: 'values',
        question: 'My biggest life goal is...',
        placeholder: 'e.g., start my own business and give back',
        icon: '🎯'
    },
    {
        id: 'family_values',
        category: 'values',
        question: 'Family means to me...',
        placeholder: 'e.g., everything - they are my foundation',
        icon: '👨‍👩‍👧‍👦'
    },
    {
        id: 'green_flag',
        category: 'values',
        question: 'A green flag for me is...',
        placeholder: 'e.g., someone who respects their parents',
        icon: '🟢'
    }
]

// Helper functions
export const getPromptsByCategory = (category) => {
    return PROFILE_PROMPTS.filter(p => p.category === category)
}

export const getRandomPrompts = (count = 3) => {
    const shuffled = [...PROFILE_PROMPTS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export const getMalawianPrompts = () => {
    return PROFILE_PROMPTS.filter(p => p.category === 'malawian')
}
