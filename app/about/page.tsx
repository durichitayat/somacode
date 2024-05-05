import React from 'react';

export default function CluelessInstructionsPage() {
    return (
        <div className="container mx-auto py-10 px-4 text-center">
            <h1 className="text-3xl font-bold mb-6 text-white">Clue-Less Game Instructions</h1>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Signing In Through GitHub</h2>
            <p className="text-white pl-4">
                1. Access the Clue-Less Project: Open your web browser and navigate to the Clue-Less project's website.
                <br />
                2. GitHub Sign-In: On the homepage, look for a button labeled "Sign in with GitHub" or something similar. Click the button to proceed.
                <br />
                3. Enter your GitHub credentials to log in and accept the permissions request.
                <br />
                4. Redirect to Clue-Less: Once the sign-in is complete, you will be redirected back to the Clue-Less project.
            </p>
            
            <div className="my-6"></div>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Navigating to the Dashboard Page</h2>
            <p className="text-white mb-6 pl-4">
                1. After signing in, you will land on the homepage of the Clue-Less project.
                <br />
                2. Navigate to the Dashboard by clicking on the "Dashboard" button in the left-hand side navigation menu.
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Creating a New Game Session</h2>
            <p className="text-white mb-6 pl-4">
                1. On the Dashboard page, enter a name for the new game session in the provided input field.
                <br />
                2. Click "New Game" to create the new game session with the specified name.
                <br />
                3. Click on the game name to enter the game session.
                <br />
                4. Once all players have joined, you can start the game.
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Joining an Existing Game Session</h2>
            <p className="text-white mb-6 pl-4">
                1. On the Dashboard page, find open game sessions.
                <br />
                2. Click on the game name of an open session you want to join.
                <br />
                3. Once all players have joined, you can start the game.
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Game Setup</h2>
            <p className="text-white mb-6 pl-12">
                1. Board Layout: The board consists of nine rooms arranged in a 3x3 grid, with hallways separating each pair of adjacent rooms. Starter squares for each character are located around the edges of the board.
                <br />
                2. Game Pieces: Six characters, six weapons, and nine rooms are part of the mansion layout.
                <br />
                3. Card Distribution: Cards are separated into three categories: characters, weapons, and rooms. One card from each category is randomly selected and set aside as the solution. Remaining cards are shuffled and distributed among the players.
                <br />
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Gameplay Rules</h2>
            <p className="text-white mb-6 pl-12">
                1. Movement:
                <br />
                Starting Moves: Move your character from the starter square to an adjacent hallway.
                <br />
                Moving from a Room: Move through a door to an adjacent hallway if unoccupied, or use a secret passage to a diagonally opposite room and make a suggestion.
                <br />
                Moving from a Hallway: Move into one of the two rooms accessible from that hallway and make a suggestion.
                <br />
                How to Move: Hover over a square and click to move your character there. If the square is occupied, you cannot move there.
                <br />
                2. Making Suggestions: Players in a room can suggest a character and weapon, specifying the room they are in. Move the suggested character into the room.
                <br />
                3. Disproving Suggestions: Other players attempt to disprove a suggestion by showing a card that matches the suggested character, weapon, or room.
                <br />
                4. Making Accusations: Players can make an accusation if they believe they have solved the mystery. A correct accusation wins the game.
                <br />
                5. Game State: Notify all players whenever the game state changes, such as when characters move, suggestions are made, or accusations are attempted.
                <br />
                6. Blocking Exits: If you are stuck in a room with all exits blocked and no secret passage is available, you cannot make a suggestion but can make an accusation.
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Game End</h2>
            <p className="text-white mb-6 pl-4">
                The game ends when a player makes a correct accusation or all possible players have made incorrect accusations.
            </p>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Strategy Tips</h2>
            <p className="text-white pl-4">
                Use a notepad to keep track of clues and cards shown by other players.
                <br />
                Observe your opponents and pay attention to the cards they use to disprove suggestions.
                <br />
                Utilize secret passages to navigate the board quickly and reach diagonally opposite rooms.
            </p>
        </div>
    );
}