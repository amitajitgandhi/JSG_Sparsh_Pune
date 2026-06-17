'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

const SPORTS = [
  {
    id: 'carrom',
    icon: '🎯',
    name: 'Carrom',
    note: 'Every Team gets to play 2 League matches',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    format: 'Doubles',
    categories: ['Male Doubles', 'Female Doubles'],
    participants: [
      { category: 'Male',   style: 'Double', count: 8 },
      { category: 'Female', style: 'Double', count: 6 },
    ],
    matches: [
      { category: 'Male',   style: 'Double', league: 32, semi: 8,  final: 4, total: 44, overall: 77 },
      { category: 'Female', style: 'Double', league: 24, semi: 6,  final: 3, total: 33, overall: '' },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'Matches shall be played on 1 Carrom Board with two players from each team.',
          'Each match shall have a maximum duration of 15 minutes.',
          'The team with the higher score at the end of 15 minutes shall be declared the winner.',
          'If a team reaches 25 points before the completion of 15 minutes, the match shall end immediately and that team shall be declared the winner.',
        ],
      },
      {
        title: 'Tie-Breaker',
        rules: [
          'If scores are tied at the end of 15 minutes, an additional 1-minute play-off shall be played; or',
          'The first team to score a point shall be declared the winner (Sudden Death), as decided by the Tournament Committee.',
        ],
      },
      {
        title: 'Scoring System',
        rules: [
          'Black Coin = 1 Point',
          'White Coin = 2 Points',
          'Queen (Red Coin) = 3 Points, provided it is legally covered.',
          'Points shall be awarded only for legally pocketed coins.',
        ],
      },
      {
        title: 'Queen Rules',
        rules: [
          'A player/team pocketing the Queen must cover it with a valid coin in the immediate subsequent shot.',
          'Failure to cover the Queen shall result in the Queen being returned to the center of the board.',
          'Queen points shall be awarded only when legally pocketed and covered.',
        ],
      },
      {
        title: 'Fouls',
        rules: [
          'Pocketing the striker.',
          'Touching any coin with hands during play.',
          'Disturbing the board or coins intentionally.',
          'Playing out of turn.',
        ],
      },
      {
        title: 'Playing Accessories',
        rules: ['The Carrom Board, Striker, Coins, and Carrom Powder required for the match shall be provided by JSG Pune Sparsh.'],
      },
    ],
  },
  {
    id: 'chess',
    icon: '♟️',
    name: 'Chess',
    note: 'Every Team gets to play 2 League matches',
    color: 'from-slate-600 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    format: 'Singles',
    categories: ['Male', 'Female'],
    participants: [
      { category: 'Male',   style: 'Single', count: 4 },
      { category: 'Female', style: 'Single', count: 2 },
    ],
    matches: [
      { category: 'Male',   style: 'Single', league: 32, semi: 8,  final: 4, total: 44, overall: 66 },
      { category: 'Female', style: 'Single', league: 16, semi: 4,  final: 2, total: 22, overall: '' },
    ],
    sections: [
      {
        title: 'Time Control',
        rules: [
          'Each player shall be allotted 7 minutes on the chess clock.',
          'An additional 30 seconds grace time may be provided if required, subject to the Arbiter\'s discretion.',
          'The total game duration shall not exceed 15 minutes.',
        ],
      },
      {
        title: 'Starting the Game',
        rules: [
          'A toss shall determine the player who will strike first.',
          'The player from the toss-winning team shall make the first move and start the clock.',
          'Players must be seated and ready before the scheduled start time.',
        ],
      },
      {
        title: 'Clock Usage',
        rules: [
          'Players must press their side of the clock immediately after completing each move.',
          'A move is considered complete only after the player has pressed the clock.',
          'Players are not permitted to stop the clock except in the presence of the Arbiter or Tournament Official.',
          'Any improper handling of the clock may result in a warning or penalty at the Arbiter\'s discretion.',
        ],
      },
      {
        title: 'Loss on Time & Draws',
        rules: [
          'A player whose clock reaches 0:00 shall lose the game.',
          'Games ending in stalemate, threefold repetition, insufficient material, or mutual agreement shall be declared a draw, subject to the Arbiter\'s approval.',
        ],
      },
      {
        title: 'Playing Accessories',
        rules: ['The Chess Board, Chess Pieces, and Chess Clock required for the tournament shall be provided by JSG Pune Sparsh.'],
      },
    ],
  },
  {
    id: 'tabletennis',
    icon: '🏓',
    name: 'Table Tennis',
    note: 'Every Team gets to play 2 League matches',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    format: 'Singles',
    categories: ['Male', 'Female'],
    participants: [
      { category: 'Male',   style: 'Single', count: 4 },
      { category: 'Female', style: 'Single', count: 1 },
    ],
    matches: [
      { category: 'Male',   style: 'Single', league: 32, semi: 8, final: 4, total: 44, overall: 57 },
      { category: 'Female', style: 'Single', league: 8,  semi: 4, final: 1, total: 13, overall: '' },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'Each match shall be played for a maximum duration of 10 minutes.',
          'A player reaching 8 points first shall be declared the winner.',
          'If the score reaches 7–7, play shall continue until one player achieves a 1-point lead.',
        ],
      },
      {
        title: 'Time Limit',
        rules: [
          'If no player reaches 8 points within 10 minutes, the player with the higher score at the end of the allotted time shall be declared the winner.',
        ],
      },
      {
        title: 'Service Rules',
        rules: [
          'Service shall alternate every 2 points.',
          'Players must follow standard Table Tennis service regulations.',
        ],
      },
      {
        title: 'Playing Accessories',
        rules: [
          'Table Tennis Balls will be provided by JSG Pune Sparsh.',
          'Participants are requested to bring their own table tennis rackets for the matches.',
        ],
      },
    ],
  },
  {
    id: 'badminton',
    icon: '🏸',
    name: 'Badminton',
    note: 'Every Team gets to play 2 League matches',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    format: 'Doubles',
    categories: ['Male Doubles', 'Female Doubles'],
    participants: [
      { category: 'Male',   style: 'Double', count: 10 },
      { category: 'Female', style: 'Double', count: 8 },
    ],
    matches: [
      { category: 'Male',   style: 'Double', league: 40, semi: 10, final: 5, total: 55, overall: 99 },
      { category: 'Female', style: 'Double', league: 32, semi: 8,  final: 4, total: 44, overall: '' },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'All matches shall be played in Doubles format (Male & Female separate).',
          'Each match shall be time-bound to 15 minutes.',
          'The first team to score 11 points (Single Set) shall be declared the winner.',
          'A team must win by a margin of 1 point.',
        ],
      },
      {
        title: 'Time Limit',
        rules: [
          'If neither team reaches 11 points within 15 minutes, the team with the higher score at the end of the allotted time shall be declared the winner.',
          'If the score reaches 10–10, play shall continue until one team achieves a 1-point lead.',
        ],
      },
      {
        title: 'Service Rules',
        rules: [
          'Standard badminton service rules shall apply.',
          'The serving side shall alternate according to rally-point scoring rules.',
          'Faults and lets shall be governed by standard badminton regulations.',
        ],
      },
      {
        title: 'Playing Accessories & Dress Code',
        rules: [
          'Yonex, Mavis or COSCO Plastic Shuttles shall be provided by JSG Pune Sparsh.',
          'Participants are required to bring their own badminton rackets.',
          'Only non-marking sports shoes are permitted on the badminton court.',
          'Participants wearing sandals, slippers, or shoes with marking soles shall play barefoot at their own risk.',
          'Participants are encouraged to wear comfortable sports attire suitable for court play.',
        ],
      },
    ],
  },
  {
    id: 'pickleball',
    icon: '🎾',
    name: 'Pickleball',
    note: 'Every Team gets to play 2 League matches',
    color: 'from-lime-500 to-green-500',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    badge: 'bg-lime-100 text-lime-800',
    format: 'Doubles',
    categories: ['Male Doubles', 'Female Doubles'],
    participants: [
      { category: 'Male',   style: 'Double', count: 6 },
      { category: 'Female', style: 'Double', count: 2 },
    ],
    matches: [
      { category: 'Male',   style: 'Double', league: 24, semi: 12, final: 6, total: 42, overall: 55 },
      { category: 'Female', style: 'Double', league: 8,  semi: 4,  final: 1, total: 13, overall: '' },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'All matches shall be played in Doubles Format.',
          'Each match shall be time-bound to 15 minutes.',
          'The first team to score 15 points shall be declared the winner.',
        ],
      },
      {
        title: 'Scoring System',
        rules: [
          'Rally Point Scoring System shall be used.',
          'A point shall be awarded on every rally, irrespective of which team is serving.',
          'If the score reaches 14–14, play shall continue until one team gains a 1-point lead.',
        ],
      },
      {
        title: 'Time Limit',
        rules: [
          'If neither team reaches 15 points within 15 minutes, the team with the higher score shall be declared the winner.',
          'If the scores are tied when time expires, a Golden Point shall be played to determine the winner.',
        ],
      },
      {
        title: 'Service Rules',
        rules: [
          'The serve must be made underhand and below waist level.',
          'The serve must land diagonally in the opponent\'s service court.',
          'The serving team must serve from behind the baseline.',
          'The Double Bounce Rule shall apply: the receiving team and serving team must each allow the ball to bounce once before volleying.',
        ],
      },
      {
        title: 'Non-Volley Zone (Kitchen)',
        rules: [
          'Players may not volley the ball while standing in the Non-Volley Zone ("Kitchen").',
          'Players may enter the Kitchen only to play a ball that has bounced.',
          'Players must not touch the Kitchen line while volleying.',
        ],
      },
      {
        title: 'Playing Accessories & Dress Code',
        rules: [
          'Only non-marking sports shoes are permitted on the Pickleball court.',
          'Players may use their own paddles.',
          'Match balls shall be provided by JSG Pune Sparsh.',
          'Participants are encouraged to wear comfortable sports attire suitable for court play.',
        ],
      },
    ],
  },
  {
    id: 'khokho',
    icon: '🏃',
    name: 'Kho Kho',
    leagueLabel: 'QF',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    format: 'Team',
    categories: ['Male Team', 'Female Team'],
    participants: [
      { category: 'Male',   style: 'Team', count: 6 },
      { category: 'Female', style: 'Team', count: 6 },
    ],
    matches: [
      { category: 'Male',   style: 'Team', league: 4, semi: 2, final: 1, total: 7, overall: 14 },
      { category: 'Female', style: 'Team', league: 4, semi: 2, final: 1, total: 7, overall: '' },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'The tournament shall be conducted on a Knockout Basis.',
          'Each match shall consist of two innings of 7 minutes each.',
          'A break of 3 minutes shall be provided between innings.',
          'Teams shall alternate between chasing and defending.',
          'The team winning the toss shall decide whether to chase or defend first.',
        ],
      },
      {
        title: 'Team Composition',
        rules: [
          'Each team shall consist of 6 players taking the field during a match.',
          'Teams may have substitute players from their registered squad.',
          'Substitutions may be made between rallies with the permission of the Referee.',
        ],
      },
      {
        title: 'Scoring & Tie-Breaker',
        rules: [
          'Each opponent dismissed (Kho) shall earn 1 point.',
          'The team with the higher score at the end of the match shall be declared the winner.',
          'In the event of a tie, an additional tie-breaker inning shall be conducted.',
          'If the tie still persists, the Tournament Committee shall determine the method for deciding the winner.',
        ],
      },
      {
        title: 'Safety & Dress Code',
        rules: [
          'Participants are encouraged to wear appropriate sports footwear.',
          'The organizers reserve the right to stop or postpone matches in case of unsafe playing conditions.',
        ],
      },
    ],
  },
  {
    id: 'volleyball',
    icon: '🏐',
    name: 'Volleyball',
    leagueLabel: 'QF',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
    format: 'Team',
    categories: ['Male Team'],
    participants: [
      { category: 'Male', style: 'Team', count: 7 },
    ],
    matches: [
      { category: 'Male', style: 'Team', league: 4, semi: 2, final: 1, total: 7, overall: 7 },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'All matches shall be played in a single set of 15 points using the Rally Point Scoring System.',
          'The first team to score 15 points shall be declared the winner.',
          'A team must win by a margin of 1 point.',
        ],
      },
      {
        title: 'Team Composition',
        rules: [
          'Each team shall consist of 7 players on the court.',
          'Teams may have substitute players from their registered squad.',
          'Substitutions may be made between rallies with the permission of the Referee.',
        ],
      },
      {
        title: 'Service Rules',
        rules: [
          'The Rally Point Scoring System shall be used — a point is awarded on every rally.',
          'The serving team shall rotate clockwise after winning back the service.',
          'Serves must be made from behind the end line and within the service area.',
        ],
      },
      {
        title: 'Safety & Accessories',
        rules: [
          'Participants are encouraged to wear appropriate sports footwear.',
          'Match balls shall be provided by JSG Pune Sparsh.',
          'The organizers reserve the right to stop or postpone matches in case of unsafe conditions.',
        ],
      },
    ],
  },
  {
    id: 'dodgeball',
    icon: '🥎',
    name: 'Dodgeball',
    leagueLabel: 'QF',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-800',
    format: 'Team',
    categories: ['Female Team'],
    participants: [
      { category: 'Female', style: 'Team', count: 7 },
    ],
    matches: [
      { category: 'Female', style: 'Team', league: 4, semi: 2, final: 1, total: 7, overall: 7 },
    ],
    sections: [
      {
        title: 'Match Format',
        rules: [
          'Each match shall be played for 10 minutes.',
          'Teams shall compete to eliminate all opposing players or have more active players remaining when time expires.',
          'The winning team shall advance to the next round.',
        ],
      },
      {
        title: 'Team Composition',
        rules: [
          'Each team shall consist of 7 players on the court.',
          'Substitutions may be made between rallies with the permission of the Referee.',
        ],
      },
      {
        title: 'Game Rules',
        rules: [
          'A player shall be declared out if hit by a live thrown ball below the shoulders.',
          'A player shall be declared out if their thrown ball is caught by an opponent before touching the ground.',
          'A player shall be declared out if they step outside the court boundary during play.',
          'Headshots are not permitted — intentional headshots may result in a warning, penalty, or disqualification.',
          'Physical contact, pushing, or obstructing opponents is not permitted.',
          'Only the balls provided by the organizers shall be used.',
          'Deliberate aggressive or unsafe throws are prohibited.',
        ],
      },
      {
        title: 'Winning the Match',
        rules: [
          'A team wins by eliminating all opposing players; or by having more active players when time expires.',
          'If the match is tied at the end of regulation time, a Sudden Death Round shall be played.',
        ],
      },
      {
        title: 'Safety & Dress Code',
        rules: [
          'Participants are encouraged to wear appropriate sports footwear.',
          'The organizers reserve the right to stop or postpone matches in case of unsafe conditions.',
        ],
      },
    ],
  },
  {
    id: 'lemonspoon',
    icon: '🍋',
    name: 'Lemon & Spoon',
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    format: 'Mixed Team',
    categories: ['Mixed Team (Male + Female)'],
    participants: [
      { category: 'Male & Female', style: 'Mix Team', count: 10 },
    ],
    matches: [
      { category: 'Male & Female', style: 'Mix Team', league: 10, semi: 0, final: 1, total: 11, overall: 11 },
    ],
    sections: [
      {
        title: 'Event Format',
        rules: [
          'The event shall be conducted in a Mixed Category (Male & Female).',
          'Each team shall nominate one participant per league race.',
          'Participants must carry a lemon on a spoon held in their mouth throughout the race.',
          'The race shall be conducted over a designated distance determined by the organizers.',
        ],
      },
      {
        title: 'Race Rules',
        rules: [
          'Participants must not touch the lemon or spoon with their hands during the race.',
          'Running is permitted, provided the participant maintains control of the lemon on the spoon.',
          'If the lemon falls from the spoon at any time, the participant shall be immediately eliminated from that race.',
          'Deliberately throwing, balancing, or supporting the lemon using any body part other than the spoon is prohibited.',
          'Participants must remain within the designated race lane, where applicable.',
        ],
      },
      {
        title: 'Winning Criteria',
        rules: [
          'The participant who crosses the finish line first while complying with all rules shall be declared the winner.',
          'In the event of a false start, the participant may receive a warning or be disqualified at the Referee\'s discretion.',
        ],
      },
      {
        title: 'Equipment',
        rules: ['The Lemon and Spoon shall be provided by JSG Pune Sparsh.'],
      },
    ],
  },
  {
    id: 'sackrace',
    icon: '👣',
    name: 'Sack Race',
    color: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    format: 'Team',
    categories: ['Male Team', 'Female Team'],
    participants: [
      { category: 'Male',   style: 'Team', count: 1 },
      { category: 'Female', style: 'Team', count: 3 },
    ],
    matches: [
      { category: 'Male',   style: 'Team', league: 0, semi: 0, final: 1, total: 1, overall: 5 },
      { category: 'Female', style: 'Team', league: 3, semi: 0, final: 1, total: 4, overall: '' },
    ],
    sections: [
      {
        title: 'Event Format',
        rules: [
          'Each team shall nominate one participant per league race.',
          'Participants must stand inside the sack with both feet fully enclosed.',
          'Participants must move forward only by hopping while remaining inside the sack.',
        ],
      },
      {
        title: 'Race Rules',
        rules: [
          'Both feet must remain inside the sack throughout the race.',
          'Participants may hold the sack with their hands while hopping.',
          'Deliberately stepping out of the sack to gain an advantage is not permitted.',
          'If a participant falls, they may resume the race from the point where they fell.',
          'Obstructing, pushing, or interfering with another participant is prohibited.',
          'Participants must remain within their designated lane, where applicable.',
        ],
      },
      {
        title: 'Winning Criteria',
        rules: [
          'The participant who crosses the finish line first while complying with all rules shall be declared the winner.',
          'In the event of a false start, the participant may receive a warning or be disqualified at the Referee\'s discretion.',
        ],
      },
      {
        title: 'Accessories',
        rules: ['Sacks required for the event shall be provided by JSG Pune Sparsh.'],
      },
    ],
  },
  {
    id: 'tugofwar',
    icon: '💪',
    name: 'Tug of War',
    leagueLabel: 'QF',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    format: 'Team',
    categories: ['Male Team', 'Female Team'],
    participants: [
      { category: 'Male',   style: 'Team', count: 9 },
      { category: 'Female', style: 'Team', count: 7 },
    ],
    matches: [
      { category: 'Male',   style: 'Team', league: 4, semi: 0, final: 1, total: 5, overall: 10 },
      { category: 'Female', style: 'Team', league: 4, semi: 0, final: 1, total: 5, overall: '' },
    ],
    sections: [
      {
        title: 'Team Composition',
        rules: [
          'Each Male Team shall consist of 9 players.',
          'Each Female Team shall consist of 7 players.',
          'Teams must report with their full squad before the match begins.',
        ],
      },
      {
        title: 'Match Format',
        rules: [
          'Each match shall be played as a Best of 3 Pulls.',
          'The team winning 2 pulls shall be declared the winner of the match.',
          'A maximum rest period of 2 minutes shall be allowed between pulls.',
        ],
      },
      {
        title: 'Winning Criteria & Competition Rules',
        rules: [
          'A team wins a pull when it successfully pulls the opposing team across the designated center mark.',
          'Teams must hold the rope with bare hands only.',
          'Knots or loops in the rope are not permitted.',
          'Players must remain within the designated competition area.',
          'Deliberately sitting down, lying down, or anchoring the rope to the body or ground is prohibited.',
        ],
      },
      {
        title: 'Fouls',
        rules: [
          'Unsportsmanlike conduct.',
          'Deliberate dropping of the rope.',
          'Use of illegal gripping techniques.',
          'Failure to follow Referee instructions.',
          'Leaving the designated competition area during a pull.',
        ],
      },
    ],
  },
  {
    id: 'threelegged',
    icon: '🏃‍♀️',
    name: 'Three-Legged Race',
    leagueLabel: 'QF',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    format: 'Pairs',
    categories: ['Male Team', 'Female Team'],
    participants: [
      { category: 'Male',   style: 'Team', count: 2 },
      { category: 'Female', style: 'Team', count: 2 },
    ],
    matches: [
      { category: 'Male',   style: 'Team', league: 2, semi: 0, final: 1, total: 3, overall: 6 },
      { category: 'Female', style: 'Team', league: 2, semi: 0, final: 1, total: 3, overall: '' },
    ],
    sections: [
      {
        title: 'Event Format',
        rules: [
          'The event shall be conducted in pairs.',
          'The adjacent legs of both participants shall be securely tied together before the race begins.',
          'The race shall be conducted over a designated distance determined by the organizers.',
          'Each team shall nominate one pair for each race as per the tournament schedule.',
        ],
      },
      {
        title: 'Race Rules',
        rules: [
          'Both participants must remain tied together throughout the race.',
          'Teams must cross the finish line together.',
          'If the leg tie becomes loose or untied, the pair must stop and have it retied by an Event Official before continuing.',
          'Pushing, pulling, obstructing, or deliberately interfering with other teams is prohibited.',
          'Participants must remain within their designated lane, where applicable.',
          'Any attempt to gain an unfair advantage may result in disqualification.',
        ],
      },
      {
        title: 'Winning Criteria',
        rules: [
          'The pair that crosses the finish line first while complying with all rules shall be declared the winner.',
          'In the event of a false start, the team may receive a warning or be disqualified at the Referee\'s discretion.',
        ],
      },
    ],
  },
  {
    id: 'relay',
    icon: '🏁',
    name: 'Square Escape Relay',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    format: 'Team',
    categories: ['Male Team', 'Female Team'],
    participants: [
      { category: 'Male',   style: 'Team', count: 4 },
      { category: 'Female', style: 'Team', count: 4 },
    ],
    matches: [
      { category: 'Male',   style: 'Team', league: 4, semi: 0, final: 1, total: 5, overall: 10 },
      { category: 'Female', style: 'Team', league: 4, semi: 0, final: 1, total: 5, overall: '' },
    ],
    sections: [
      {
        title: 'Game Format',
        rules: [
          'The playing area shall consist of 8 marked squares arranged in sequence (4 each in parallel), as per the event layout.',
          'Each match shall be played for a maximum duration of 5 minutes.',
          'Two teams shall compete against each other.',
          'One team shall act as the Attackers (Runners) and the other as the Defenders (Blockers), decided on toss.',
        ],
      },
      {
        title: 'Objective',
        rules: [
          'The Attacking Team must successfully pass through all 4 square zones in sequence and complete the relay in the shortest possible time.',
          'The Defending Team must obstruct the runners by blocking the designated pathways without physical contact.',
        ],
      },
      {
        title: 'Defender Rules',
        rules: [
          'Defenders shall remain within their designated pathways at all times.',
          'Defenders may obstruct runners only by movement within their designated pathway.',
          'Pushing, holding, tripping, grabbing, or any physical contact that may cause injury is strictly prohibited.',
          'Defenders may touch a runner with their hand to declare the runner out.',
        ],
      },
      {
        title: 'Runner Rules',
        rules: [
          'Runners must pass through the designated squares in the prescribed sequence.',
          'Each runner must remain within the marked square and pathway.',
          'A runner stepping outside the marked square or pathway shall be considered to have committed a foul.',
          'The next runner may start only after receiving the relay tag from the previous runner.',
        ],
      },
      {
        title: 'Winning Criteria',
        rules: [
          'The team completing the relay course in the shortest overall time shall be declared the winner.',
          'If all four runners of one team successfully complete the course, that team shall be ranked higher.',
          'If neither team completes within the allotted time, the team with the maximum number of successful runners wins.',
          'If tied on runners, the shortest cumulative completion time shall determine the winner.',
          'If a tie still persists, the Referee shall conduct a tie-break round.',
        ],
      },
    ],
  },
]

const COMMON_RULES = [
  {
    title: '⏰ Reporting & Walkover',
    rules: [
      'Players/Teams must report at least 10 minutes before their scheduled match or event.',
      'Failure to report within the allotted time may result in a walkover or disqualification.',
      'A player/team arriving more than 5 minutes late may forfeit the match or event.',
      'The Tournament Committee reserves the right to make exceptions under exceptional circumstances.',
    ],
  },
  {
    title: '🤝 Conduct & Sportsmanship',
    rules: [
      'All participants shall maintain sportsmanship, discipline, and fair play throughout the tournament.',
      'Any misconduct, abusive language, dangerous play, or unsporting behavior may result in a warning, penalty, or disqualification.',
      'Players shall comply with all instructions issued by Event Officials and Referees.',
      'The use of mobile phones, electronic devices, or external assistance during competition is strictly prohibited where applicable.',
    ],
  },
  {
    title: '⚖️ Protests & Disputes',
    rules: [
      'Any protest must be submitted immediately after the match/event through the Team Captain or participant concerned.',
      'All disputes shall be referred to the Referee or Tournament Officials for resolution.',
      'The Referee\'s decision regarding rules, fouls, scoring, and match outcomes shall be final during play.',
      'Decisions of the Referee and Tournament Committee shall be final and binding on all participants.',
    ],
  },
  {
    title: '🛡️ Safety & Event Management',
    rules: [
      'Participants are encouraged to wear appropriate sports attire and footwear suitable for their respective events.',
      'The organizers reserve the right to stop, postpone, reschedule, or cancel any match/event in the interest of safety or unforeseen circumstances.',
      'The JSG Pune Sparsh Committee shall have full authority over the conduct of the tournament and their decision shall be final and binding in all matters.',
    ],
  },
]

// ─── Components ──────────────────────────────────────────────────────────────

function RuleSection({ title, rules }: { title: string; rules: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        <span className={`text-gray-400 dark:text-gray-500 text-lg leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>›</span>
      </button>
      {open && (
        <ul className="px-4 pb-4 pt-1 space-y-2 bg-gray-50 dark:bg-gray-900">
          {rules.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MatchTable({ participants, matches, leagueLabel = 'League' }: { participants: any[]; matches: any[]; leagueLabel?: string }) {
  return (
    <div className="space-y-3 mb-4">
      {/* Participants */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Participants per team</p>
        <div className="grid grid-cols-2 gap-2">
          {participants.map((p, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{p.category}</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{p.count} players</span>
            </div>
          ))}
        </div>
      </div>
      {/* Matches */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Match schedule</p>
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                <th className="px-3 py-2 text-left font-semibold">Category</th>
                <th className="px-3 py-2 text-center font-semibold">{leagueLabel}</th>
                <th className="px-3 py-2 text-center font-semibold">Semi</th>
                <th className="px-3 py-2 text-center font-semibold">Final</th>
                <th className="px-3 py-2 text-center font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {matches.map((m, i) => (
                <tr key={i} className="bg-white dark:bg-gray-800">
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{m.category}</td>
                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{m.league}</td>
                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{m.semi}</td>
                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{m.final}</td>
                  <td className="px-3 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Overall total — shown as a summary line below the table */}
        {(() => {
          const overall = matches.find(m => m.overall !== '')?.overall
          return overall ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-left">
              Total matches across all categories:{' '}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{overall}</span>
            </p>
          ) : null
        })()}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RulesPage() {
  const [activeSport, setActiveSport] = useState<string | null>(null)
  const [everTapped,  setEverTapped]  = useState(false)

  const sport = activeSport ? SPORTS.find(s => s.id === activeSport) : null

  // Scroll to top whenever the active sport changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeSport])

  const selectSport = (id: string) => { setEverTapped(true); setActiveSport(id) }
  const backToAll   = () => setActiveSport(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          {activeSport ? (
            <button
              onClick={backToAll}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition"
              aria-label="Back to all sports"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          ) : (
            <Link href="/events/khelotsav" className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
              {activeSport === 'common'
                ? 'Common Tournament Rules'
                : sport
                ? `${sport.icon} ${sport.name}`
                : 'Rules & Regulations'}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Sparsh Khelotsav 2026</p>
          </div>
          {activeSport && (
            <button
              onClick={backToAll}
              className="flex-shrink-0 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-2.5 py-1 rounded-full transition"
            >
              All sports
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Home view ─────────────────────────────────────────────────────── */}
        {!activeSport && (
          <>
            {/* Hero */}
            <div className="text-center mb-7">
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-emerald-500 to-orange-500 mb-2">
                SPARSH KHELOTSAV 2026
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Games Rules &amp; Regulations
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                Tap a sport to view its rules
              </p>
            </div>

            {/* Sport chips — same style as "Sports on the Court" */}
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5 mb-6">
              {SPORTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectSport(s.id)}
                  className={`group flex flex-col items-center gap-1.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer ${!everTapped ? 'animate-pulse' : ''}`}
                >
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-125">{s.icon}</span>
                  <p className="text-[11px] font-semibold leading-tight text-slate-700 dark:text-gray-200">{s.name}</p>
                  <span className="mt-1 text-[9px] font-bold text-sky-500 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    View →
                  </span>
                </button>
              ))}
            </div>

            {/* Team composition table */}
            <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm font-bold text-gray-900 dark:text-white">👥 Team Player Allocation</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  How many players each sport needs from your team of 30+
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[320px]">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                      <th className="px-3 py-2 text-left font-semibold">Sport</th>
                      <th className="px-3 py-2 text-center font-semibold text-blue-600 dark:text-blue-400">Male</th>
                      <th className="px-3 py-2 text-center font-semibold text-pink-600 dark:text-pink-400">Female</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {[
                      { icon: '🎯', sport: 'Carrom',              male: 8,  female: 6,  note: 'Doubles' },
                      { icon: '♟️', sport: 'Chess',               male: 4,  female: 2,  note: 'Singles' },
                      { icon: '🏓', sport: 'Table Tennis',        male: 4,  female: 1,  note: 'Singles' },
                      { icon: '🏸', sport: 'Badminton',           male: 10, female: 8,  note: 'Doubles' },
                      { icon: '🎾', sport: 'Pickleball',          male: 6,  female: 2,  note: 'Doubles' },
                      { icon: '🏃', sport: 'Kho Kho',             male: 6,  female: 6,  note: 'Team' },
                      { icon: '🏐', sport: 'Volleyball',          male: 7,  female: 0,  note: 'Male only' },
                      { icon: '🥎', sport: 'Dodgeball',           male: 0,  female: 7,  note: 'Female only' },
                      { icon: '🍋', sport: 'Lemon & Spoon',       male: 5,  female: 5,  note: 'Mixed 10' },
                      { icon: '👣', sport: 'Sack Race',           male: 1,  female: 3,  note: '' },
                      { icon: '💪', sport: 'Tug of War',          male: 9,  female: 7,  note: 'Team' },
                      { icon: '🏃‍♀️', sport: 'Three-Legged Race',  male: 2,  female: 2,  note: 'Pairs' },
                      { icon: '🏁', sport: 'Square Escape Relay', male: 4,  female: 4,  note: 'Team' },
                    ].map((row, i) => (
                      <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                          <span className="mr-1.5">{row.icon}</span>
                          <span className="font-medium">{row.sport}</span>
                          {row.note ? <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">({row.note})</span> : null}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-blue-700 dark:text-blue-400">
                          {row.male > 0 ? row.male : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-pink-700 dark:text-pink-400">
                          {row.female > 0 ? row.female : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-gray-50 dark:bg-gray-700 font-bold border-t-2 border-gray-200 dark:border-gray-600">
                      <td className="px-3 py-2.5 text-gray-900 dark:text-white text-xs">Total player slots</td>
                      <td className="px-3 py-2.5 text-center text-blue-700 dark:text-blue-400">
                        {8+4+4+10+6+6+7+0+5+1+9+2+4}
                      </td>
                      <td className="px-3 py-2.5 text-center text-pink-700 dark:text-pink-400">
                        {6+2+1+8+2+6+0+7+5+3+7+2+4}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  ⚠️ Slot count reflects required players per category. A single player can fill slots across multiple sports — rotations ensure everyone plays 3+ sports.
                </p>
              </div>
            </div>

            {/* Common rules tile */}
            <button
              onClick={() => selectSport('common')}
              className="w-full text-left bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 border border-sky-100 dark:border-sky-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-xl">📋</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Common Tournament Rules</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reporting, conduct, protests &amp; safety — applies to all sports</p>
                </div>
                <span className="text-sky-400 dark:text-sky-500 text-lg flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-150">›</span>
              </div>
            </button>
          </>
        )}

        {/* ── Sport detail ──────────────────────────────────────────────────── */}
        {activeSport && activeSport !== 'common' && sport && (
          <div>
            {/* Sport banner */}
            <div className={`${sport.bg} ${sport.border} dark:bg-gray-800 dark:border-gray-700 border rounded-2xl p-5 mb-5`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{sport.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{sport.name}</h2>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sport.categories.map((c, i) => (
                      <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sport.badge}`}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Per-sport note */}
              {(sport as any).note && (
                <div className="flex items-center gap-2 bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/20 rounded-xl px-3 py-2 mb-4">
                  <span className="text-base flex-shrink-0">ℹ️</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{(sport as any).note}</p>
                </div>
              )}

              <MatchTable participants={sport.participants} matches={sport.matches} leagueLabel={(sport as any).leagueLabel} />
            </div>

            {/* Rule sections */}
            <div className="space-y-2">
              {sport.sections.map((sec, i) => (
                <RuleSection key={i} title={sec.title} rules={sec.rules} />
              ))}
            </div>

            {/* Common rules nudge */}
            <button
              onClick={() => selectSport('common')}
              className="mt-4 w-full text-left bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl px-4 py-3 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition flex items-center gap-3 group"
            >
              <span className="text-lg">📋</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Common Tournament Rules</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reporting, conduct &amp; safety — applies to all sports</p>
              </div>
              <span className="text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform duration-150">›</span>
            </button>
          </div>
        )}

        {/* ── Common rules detail ───────────────────────────────────────────── */}
        {activeSport === 'common' && (
          <div>
            {/* Banner — light gradient, not dark */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/30 dark:to-indigo-900/30 border border-sky-100 dark:border-sky-800 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Common Tournament Rules</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Applies to all events at Sparsh Khelotsav 2026</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {COMMON_RULES.map((sec, i) => (
                <RuleSection key={i} title={sec.title} rules={sec.rules} />
              ))}
            </div>
          </div>
        )}

        {/* ── Back button ───────────────────────────────────────────────────── */}
        {activeSport && (
          <div className="mt-6">
            <button
              onClick={backToAll}
              className="text-sm text-sky-600 dark:text-sky-400 font-semibold hover:text-sky-800 dark:hover:text-sky-300 transition flex items-center gap-1"
            >
              ← All sports
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
