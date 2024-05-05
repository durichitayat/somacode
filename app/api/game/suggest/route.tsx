
type GameRequestBody = {suggestion: string, gameid: string, email: string, playerMove: string, playerData: any, gameData: any, gameData: any, whoseTurn: any };


const suspectNames = [
    'Miss Scarlet', 'Professor Plum', 'Mrs. Peacock',
    'Mr. Green', 'Colonel Mustard', 'Mrs. White'
  ]
  
  const roomNames = [
    'Kitchen', 'Ballroom', 'Conservatory', 'Dining room',
    'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study'
  ];
  
  const weaponNames = [
    'Revolver', 'Candlestick', 'Knife',
    'Lead Pipe', 'Wrench', 'Rope'
  ];
  

export async function POST (request: Request) { // this will contain most game logic so keep it tidy! functions wherever you can
    try {

        // get player move info and log
        const {suggestion, gameid, email, playerMove, playerData, gameData, whoseTurn }: GameRequestBody = await request.json();
        console.log("email: ", email, "playerMove: ", playerMove);
    
        // Parse the suggestion
        const [suspect, weapon] = suggestion.split(', ');
    
        // Validate the suspect and weapon
        if (!suspectNames.includes(suspect) || !weaponNames.includes(weapon)) {
            return "invalid";
        }
    
        // move suggested suspect to suggestor's square
        // const { rows: playerData } = await sql`
        //     SELECT email
        //     FROM Players
        //     WHERE character ILIKE ${suspect} AND gameid = ${gameid}
        //     LIMIT 1;
        // `;
    
        const suggesteeEmail = whoseTurn.email
    
        if (suggesteeEmail !== null) {
            await setSinglePlayerCoords(suggesteeEmail, (await getPlayerCoords(email, gameid)), gameid);
        }
    
        const room = await getPlayerRoom(email, gameid);
    
        const action: string = email + " suggested that " + suspect + " killed someone with a " + weapon + " in the " + room + ". ";
    
        // const { rows: gameData } = await sql`
        //     SELECT CurrentTurn, TurnCount
        //     FROM Games
        //     WHERE gameid = ${gameid}
        //     LIMIT 1;
        // `;
    
        const originalTurn = gameData.length > 0 ? gameData[0].currentturn : null;
        const turnCount = gameData.length > 0 ? gameData[0].turncount : null;
        let currTurn = originalTurn + 1;
        if (currTurn > turnCount) {
            currTurn = 1;
        }
    
        while (currTurn != originalTurn) {
            const { rows: playerEmail } = await sql`
            SELECT email
            FROM Players
            WHERE gameid = ${gameid} AND TurnOrder = ${currTurn}
            LIMIT 1;`;
            const currPlayerEmail = playerEmail.length > 0 ? playerEmail[0].email : null;
    
            let matches: string[] = [];
    
            // @TODO: use playerData and currPlayerEmail to get the cards for the current player
            for (const card of currPlayerCards) {
            const name = card[1];
        
            // Check if the card matches the suggestion
            if (name === suspect || name === weapon || name === room) {
                matches.push(name);
            }
            }
    
            if (matches.length > 0) {
            // If there are matches, randomly select one
            const randomMatch = matches[Math.floor(Math.random() * matches.length)];
            await setMostRecentAction(gameid, action + currPlayerEmail + " refuted this by showing " + randomMatch + ".");
            return `Refuted! ${randomMatch} was shown. `;
            } 
    
            currTurn++;
            if (currTurn > turnCount) {
            currTurn = 1;
            }
        }
    
        await setMostRecentAction(gameid, action + "No one could refute their suggestion!");
        return "No one could refute your suggestion! ";
    
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
  
  }