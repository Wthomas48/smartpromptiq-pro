/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ LOCAL MUSIC LIBRARY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 446 Royalty-Free Music Tracks - All stored locally in /public/music/
 *
 * Features:
 * - 100% Royalty-free for commercial use
 * - Organized by genre and mood
 * - Various durations from 30 seconds to 12 minutes
 * - Perfect for intros, outros, backgrounds, and content creation
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { MusicGenreType } from './premiumMusic';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LocalTrack {
  id: string;
  name: string;
  filename: string;
  genre: MusicGenreType;
  mood: string;
  duration: number; // seconds
  tags: string[];
  audioUrl: string;
  source: 'local';
}

// Helper to create audio URL from filename
const localAudio = (filename: string) => `/music/${encodeURIComponent(filename)}`;

// Helper to parse duration from filename (e.g., "1m21s" -> 81 seconds)
const parseDuration = (filename: string): number => {
  const match = filename.match(/^(\d+)m(\d+)s/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 180; // default 3 minutes
};

// Helper to generate ID from filename
const generateId = (filename: string): string => {
  return filename
    .replace('.mp3', '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Helper to categorize track by keywords
const categorizeTrack = (filename: string): { genre: MusicGenreType; mood: string; tags: string[] } => {
  const name = filename.toLowerCase();

  // Electronic/EDM
  if (name.includes('techno') || name.includes('electro') || name.includes('house') ||
      name.includes('disco') || name.includes('edm') || name.includes('trance') ||
      name.includes('progressive') || name.includes('tribal')) {
    return { genre: 'electronic', mood: 'energetic', tags: ['electronic', 'dance', 'edm'] };
  }

  // Hip-Hop/Urban
  if (name.includes('hip hop') || name.includes('hip-hop') || name.includes('rap') ||
      name.includes('urban') || name.includes('trap') || name.includes('rnb') ||
      name.includes('r&b') || name.includes('dancehall')) {
    return { genre: 'hiphop', mood: 'urban', tags: ['hiphop', 'urban', 'beats'] };
  }

  // Jazz/Soul
  if (name.includes('jazz') || name.includes('sax') || name.includes('saxophone') ||
      name.includes('soul') || name.includes('blues') || name.includes('swing')) {
    return { genre: 'jazz', mood: 'smooth', tags: ['jazz', 'soulful', 'smooth'] };
  }

  // Acoustic/Folk
  if (name.includes('acoustic') || name.includes('guitar') || name.includes('folk') ||
      name.includes('unplugged') || name.includes('celtic') || name.includes('country')) {
    return { genre: 'acoustic', mood: 'warm', tags: ['acoustic', 'organic', 'natural'] };
  }

  // Cinematic/Epic
  if (name.includes('orchestral') || name.includes('film') || name.includes('dramatic') ||
      name.includes('epic') || name.includes('cinematic') || name.includes('trailer') ||
      name.includes('score') || name.includes('blockbuster') || name.includes('chase')) {
    return { genre: 'cinematic', mood: 'dramatic', tags: ['cinematic', 'epic', 'orchestral'] };
  }

  // Calm/Ambient
  if (name.includes('slow') || name.includes('chill') || name.includes('calm') ||
      name.includes('ambient') || name.includes('peaceful') || name.includes('relax') ||
      name.includes('zen') || name.includes('meditation') || name.includes('ocean')) {
    return { genre: 'calm', mood: 'relaxing', tags: ['calm', 'relaxing', 'peaceful'] };
  }

  // Lo-Fi
  if (name.includes('lofi') || name.includes('lo-fi') || name.includes('study') ||
      name.includes('coffee') || name.includes('cafe') || name.includes('laid back')) {
    return { genre: 'lofi', mood: 'chill', tags: ['lofi', 'chill', 'study'] };
  }

  // Inspirational
  if (name.includes('inspirational') || name.includes('motivational') || name.includes('uplifting') ||
      name.includes('hope') || name.includes('triumph') || name.includes('victory') ||
      name.includes('positive') || name.includes('happy') || name.includes('sunshine')) {
    return { genre: 'inspirational', mood: 'uplifting', tags: ['inspirational', 'positive', 'uplifting'] };
  }

  // Upbeat/Energetic
  if (name.includes('funk') || name.includes('groove') || name.includes('rock') ||
      name.includes('metal') || name.includes('aggressive') || name.includes('power') ||
      name.includes('energy') || name.includes('high tempo') || name.includes('fast')) {
    return { genre: 'upbeat', mood: 'energetic', tags: ['upbeat', 'energetic', 'powerful'] };
  }

  // Podcast/Intro (short tracks)
  if (name.includes('intro') || name.includes('outro') || name.includes('sting') ||
      name.includes('news') || name.includes('broadcast')) {
    return { genre: 'podcast', mood: 'professional', tags: ['intro', 'podcast', 'broadcast'] };
  }

  // Corporate/Business
  if (name.includes('corporate') || name.includes('business') || name.includes('professional') ||
      name.includes('tech') || name.includes('startup') || name.includes('modern')) {
    return { genre: 'corporate', mood: 'professional', tags: ['corporate', 'business', 'professional'] };
  }

  // Piano-based
  if (name.includes('piano')) {
    return { genre: 'calm', mood: 'emotional', tags: ['piano', 'emotional', 'beautiful'] };
  }

  // Default to upbeat for generic/uncategorized
  return { genre: 'upbeat', mood: 'versatile', tags: ['background', 'versatile', 'general'] };
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL TRACK LIBRARY - 446 Royalty-Free Tracks
// ═══════════════════════════════════════════════════════════════════════════════

const LOCAL_TRACK_FILENAMES = [
  "0m30s hip hop.mp3",
  "0m30s hip-hop.mp3",
  "0m38s hip hop.mp3",
  "0m49s essemble.mp3",
  "0m53s celtic.mp3",
  "0m54s piano drums rythm.mp3",
  "0m59s acoustic rock.mp3",
  "12m33s slow melody.mp3",
  "12m33s slow piano ocean.mp3",
  "1m03s funk.mp3",
  "1m20s blues.mp3",
  "1m21s acid techno.mp3",
  "1m21s slow chill beat.mp3",
  "1m30s sax laid back.mp3",
  "1m38s acoustic.mp3",
  "1m51s alternative hip hop.mp3",
  "1m58s blues.mp3",
  "2020 Space.mp3",
  "2m02s slow ballad.mp3",
  "2m08s alternative rnb.mp3",
  "2m11s slow.mp3",
  "2m17s harmonica bdiddley.mp3",
  "2m28s blues shuffle.mp3",
  "2m29s slow beat.mp3",
  "2m32s alternative dance.mp3",
  "2m58s film score.mp3",
  "2m59s reggae.mp3",
  "3m05s dancehall.mp3",
  "3m24s disco.mp3",
  "3m28s house.mp3",
  "3m37s funk.mp3",
  "3m41s blues.mp3",
  "3m43s orchestral.mp3",
  "3m48s aggressive.mp3",
  "3m58s electro house.mp3",
  "4m00s slow melody vibe hop.mp3",
  "4m04s rythm rock.mp3",
  "4m04s unplugged.mp3",
  "4m06s dramatic.mp3",
  "4m07s house disco.mp3",
  "4m09s electro groove.mp3",
  "4m15s progressive euro.mp3",
  "4m17s saxsaphone.mp3",
  "4m24s tribal house.mp3",
  "4m26s rythm guitar riff.mp3",
  "4m27s house.mp3",
  "4m28s house dj.mp3",
  "4m41s high tempo.mp3",
  "5m30s techno.mp3",
  "5m41s power ballad.mp3",
  "5m57s slow melody.mp3",
  "5m58s house.mp3",
  "6m14s metal.mp3",
  "70s B-Movie.mp3",
  "70s Love Theme.mp3",
  "70s Sway.mp3",
  "7m16s abstract piano.mp3",
  "80s Groove.mp3",
  "80s Wine.mp3",
  "Access Denied.mp3",
  "acousticorgan.mp3",
  "Afterglow.mp3",
  "All Privates.mp3",
  "All the Way.mp3",
  "And Now.mp3",
  "Are We There Yet.mp3",
  "Are You Ready.mp3",
  "Assisted Lanes.mp3",
  "Audiolific.mp3",
  "Background Wish.mp3",
  "balladic.mp3",
  "Band Bandits.mp3",
  "Basically.mp3",
  "Battle.mp3",
  "beautifulkeys.mp3",
  "Beef Jerky.mp3",
  "Better Than That.mp3",
  "Better Ways.mp3",
  "Beyond Words.mp3",
  "Big Search.mp3",
  "Billing Dead.mp3",
  "Bing Bang.mp3",
  "Biz Blues.mp3",
  "Black Mamba.mp3",
  "Blockbuster.mp3",
  "bluespiano.mp3",
  "boomtish.mp3",
  "Bought It Whole.mp3",
  "Boxed Mice.mp3",
  "Branded Post.mp3",
  "Breakin' Groove.mp3",
  "Bugle Boys.mp3",
  "Burning Paper.mp3",
  "Burning Scam.mp3",
  "cadetfork.mp3",
  "Canned Ones.mp3",
  "Can't Ignore.mp3",
  "Carla's Finish.mp3",
  "celticcharm.mp3",
  "chantcraft.mp3",
  "Chase Sequence.mp3",
  "Chasing Down.mp3",
  "Cheap Source.mp3",
  "City Pulse.mp3",
  "Click Factor.mp3",
  "Come On.mp3",
  "Comic Hero.mp3",
  "Coming Back.mp3",
  "Cool Morning.mp3",
  "Covert Intention.mp3",
  "Curtain Fall.mp3",
  "Cut Me Out.mp3",
  "Dance Like.mp3",
  "Deep Down.mp3",
  "Depths of Music.mp3",
  "Disco Medusa.mp3",
  "Discovery.mp3",
  "distorted.mp3",
  "Don't Fight It.mp3",
  "Double Bounce.mp3",
  "Down Below.mp3",
  "Drop It.mp3",
  "Drumming in Fives.mp3",
  "dubstep.mp3",
  "Easy Does It.mp3",
  "Easy Feelings.mp3",
  "Easy Lemon.mp3",
  "Easy Wind.mp3",
  "electrorocklatin.mp3",
  "Elevate.mp3",
  "Emerge.mp3",
  "Enchant.mp3",
  "Endgame.mp3",
  "Escalate.mp3",
  "Ethereal.mp3",
  "Eureka.mp3",
  "Even Funker.mp3",
  "Even Steven.mp3",
  "Every Minute.mp3",
  "Exit Points.mp3",
  "Face This.mp3",
  "Falling Stars.mp3",
  "Far Cry.mp3",
  "Fast Groove.mp3",
  "Fear of Losing.mp3",
  "Feel Alive.mp3",
  "Feel Good.mp3",
  "Feel That.mp3",
  "Feeling Jazzy.mp3",
  "Feeling This.mp3",
  "Fired Up.mp3",
  "Flatline.mp3",
  "Flavour.mp3",
  "Flip.mp3",
  "Flow With It.mp3",
  "Fly Away.mp3",
  "Follow Through.mp3",
  "For the Better.mp3",
  "Forces.mp3",
  "Forget It.mp3",
  "Freefall.mp3",
  "Fresh Start.mp3",
  "From Here.mp3",
  "Full Charge.mp3",
  "Full Force.mp3",
  "Full Throttle.mp3",
  "funked.mp3",
  "Funky Chunk.mp3",
  "Funky Future.mp3",
  "Funky Junky.mp3",
  "Funky Treatment.mp3",
  "Get Busy.mp3",
  "Get Fresh.mp3",
  "Get Involved.mp3",
  "Get Moving.mp3",
  "Get Real.mp3",
  "Getting Down.mp3",
  "Getting Ready.mp3",
  "Ghost Town.mp3",
  "Glamour Shot.mp3",
  "Go Hard.mp3",
  "Go Time.mp3",
  "Gold Mine.mp3",
  "Good Days.mp3",
  "Good Show.mp3",
  "Good Times.mp3",
  "Good Vibes.mp3",
  "Gotta Move.mp3",
  "Grind Time.mp3",
  "Groove Along.mp3",
  "Groove Town.mp3",
  "grooveboxchat.mp3",
  "groovygrowl.mp3",
  "Happy Feels.mp3",
  "Happy Go Lucky.mp3",
  "Happy Hour.mp3",
  "Happy Life.mp3",
  "Happy Tune.mp3",
  "Hard Knock.mp3",
  "Haunted.mp3",
  "Heart of Funk.mp3",
  "Heavy Dose.mp3",
  "High Hopes.mp3",
  "High Life.mp3",
  "High Noon.mp3",
  "High Roller.mp3",
  "Hit Hard.mp3",
  "Hit Squad.mp3",
  "Hold It Down.mp3",
  "Hold On.mp3",
  "Holler.mp3",
  "Horizon.mp3",
  "Hot Shot.mp3",
  "House Party.mp3",
  "Hyper Drive.mp3",
  "Ignite.mp3",
  "In Motion.mp3",
  "In the Zone.mp3",
  "Inner Peace.mp3",
  "Inside Out.mp3",
  "Intense.mp3",
  "Into the Night.mp3",
  "It Happens.mp3",
  "jazzbox.mp3",
  "Jazzy Blues.mp3",
  "Jump Start.mp3",
  "Just Breathe.mp3",
  "Just Dance.mp3",
  "Just Do It.mp3",
  "Just Right.mp3",
  "Keep Going.mp3",
  "Keep It Real.mp3",
  "Keep Moving.mp3",
  "Keep Pushing.mp3",
  "Kick Back.mp3",
  "Kickin It.mp3",
  "Kick Start.mp3",
  "Laid Back.mp3",
  "Last Chance.mp3",
  "latinhouse.mp3",
  "Launch.mp3",
  "Let Go.mp3",
  "Let It Flow.mp3",
  "Let It Ride.mp3",
  "Let Loose.mp3",
  "Life Goes On.mp3",
  "Lift Off.mp3",
  "Light It Up.mp3",
  "Like This.mp3",
  "Live It Up.mp3",
  "Live Wire.mp3",
  "Lock In.mp3",
  "Long Night.mp3",
  "Look Alive.mp3",
  "Loud and Clear.mp3",
  "Love Story.mp3",
  "Low Key.mp3",
  "Magic Touch.mp3",
  "Main Event.mp3",
  "Make It Count.mp3",
  "Make It Happen.mp3",
  "Make Moves.mp3",
  "Make Way.mp3",
  "Manifest.mp3",
  "Maximum.mp3",
  "Meet Up.mp3",
  "Mellow Yellow.mp3",
  "Midnight.mp3",
  "Mind Control.mp3",
  "Mission.mp3",
  "Momentum.mp3",
  "Money Maker.mp3",
  "Money Moves.mp3",
  "More Than Enough.mp3",
  "Morning Light.mp3",
  "Move Forward.mp3",
  "Move It.mp3",
  "Moving On.mp3",
  "Moving Up.mp3",
  "My Time.mp3",
  "Neon Lights.mp3",
  "Never Give Up.mp3",
  "Never Stop.mp3",
  "New Day.mp3",
  "New Heights.mp3",
  "New Level.mp3",
  "New Start.mp3",
  "Next Level.mp3",
  "Night Drive.mp3",
  "Night Moves.mp3",
  "Night Owl.mp3",
  "Night Shift.mp3",
  "Night Time.mp3",
  "No Limits.mp3",
  "No Stopping.mp3",
  "Now or Never.mp3",
  "On Fire.mp3",
  "On Point.mp3",
  "On The Move.mp3",
  "On Top.mp3",
  "One More Time.mp3",
  "One Shot.mp3",
  "One Way.mp3",
  "Open Road.mp3",
  "Overdrive.mp3",
  "Own It.mp3",
  "Party Mode.mp3",
  "Party Time.mp3",
  "Peak Performance.mp3",
  "Perfect Day.mp3",
  "Perfect Storm.mp3",
  "Pinnacle.mp3",
  "Pipeline.mp3",
  "Play Hard.mp3",
  "Play It Cool.mp3",
  "Play Time.mp3",
  "Pop Off.mp3",
  "Power Move.mp3",
  "Power Play.mp3",
  "Power Up.mp3",
  "Pressure.mp3",
  "Prime Time.mp3",
  "Progress.mp3",
  "Prove It.mp3",
  "Pull Up.mp3",
  "Pulse.mp3",
  "Push Forward.mp3",
  "Push It.mp3",
  "Push Through.mp3",
  "Quest.mp3",
  "Quick Step.mp3",
  "Radar.mp3",
  "Radiate.mp3",
  "Raw Energy.mp3",
  "Reach Out.mp3",
  "Ready Set Go.mp3",
  "Real Deal.mp3",
  "Red Alert.mp3",
  "Red Zone.mp3",
  "Release.mp3",
  "Relentless.mp3",
  "Rewind.mp3",
  "Rhythm.mp3",
  "Right Now.mp3",
  "Rise Above.mp3",
  "Rise and Shine.mp3",
  "Rising.mp3",
  "Road Trip.mp3",
  "Rock It.mp3",
  "Rock Solid.mp3",
  "Roll Out.mp3",
  "Run It.mp3",
  "Rush.mp3",
  "Seize the Day.mp3",
  "Send It.mp3",
  "Set Free.mp3",
  "Shake It.mp3",
  "Sharp.mp3",
  "Shine.mp3",
  "Shoot for Stars.mp3",
  "Show Time.mp3",
  "Shut It Down.mp3",
  "Skyline.mp3",
  "Smooth Operator.mp3",
  "Snap Back.mp3",
  "Solid Ground.mp3",
  "Soul Fire.mp3",
  "Sound Off.mp3",
  "Spark.mp3",
  "Speed Up.mp3",
  "Spin.mp3",
  "Stand Out.mp3",
  "Stand Tall.mp3",
  "Stand Up.mp3",
  "Star Power.mp3",
  "Start Fresh.mp3",
  "Stay Focused.mp3",
  "Stay Gold.mp3",
  "Stay Ready.mp3",
  "Stay Strong.mp3",
  "Stay True.mp3",
  "Steady.mp3",
  "Step Forward.mp3",
  "Step It Up.mp3",
  "Step Up.mp3",
  "Stomp.mp3",
  "Straight Ahead.mp3",
  "Straight Up.mp3",
  "Stranded.mp3",
  "Street Smart.mp3",
  "Strength.mp3",
  "Strike.mp3",
  "Strong.mp3",
  "Summer Days.mp3",
  "Summer Vibes.mp3",
  "Sun Rise.mp3",
  "Supercharge.mp3",
  "Surge.mp3",
  "Sweet Life.mp3",
  "Swift.mp3",
  "Switch Up.mp3",
  "Take Charge.mp3",
  "Take Flight.mp3",
  "Take It Easy.mp3",
  "Take Off.mp3",
  "Take Over.mp3",
  "Talk Is Cheap.mp3",
  "Tension.mp3",
  "The Chase.mp3",
  "The Climb.mp3",
  "The Drop.mp3",
  "The Grind.mp3",
  "The Journey.mp3",
  "The Movement.mp3",
  "The Rush.mp3",
  "The Vibe.mp3",
  "Thrive.mp3",
  "Thunder.mp3",
  "Time Is Now.mp3",
  "Time to Shine.mp3",
  "Top Gear.mp3",
  "Top of the World.mp3",
  "Tough Crowd.mp3",
  "Transcend.mp3",
  "Transform.mp3",
  "Triumph.mp3",
  "True Grit.mp3",
  "Trust.mp3",
  "Turn It Up.mp3",
  "Turn Up.mp3",
  "Turnaround.mp3",
  "Turning Point.mp3",
  "Twist.mp3",
  "Unbreakable.mp3",
  "Undeniable.mp3",
  "Unstoppable.mp3",
  "Up and Running.mp3",
  "Upgrade.mp3",
  "Urban Legend.mp3",
  "Vibe Check.mp3",
  "Victory.mp3",
  "Voltage.mp3",
  "Wake Up.mp3",
  "Walk It.mp3",
  "Warm Up.mp3",
  "Wave.mp3",
  "Way Up.mp3",
  "We Made It.mp3",
  "Wide Open.mp3",
  "Wild.mp3",
  "Win Big.mp3",
  "Wired.mp3",
  "Work It.mp3",
  "Work It Out.mp3",
  "Working Sound.mp3",
  "World Tonight.mp3",
  "Worse Than Them.mp3",
  "wowsnick.mp3",
  "wungashake.mp3",
  "Yesterday's News.mp3",
  "You and I.mp3",
  "You Got It.mp3",
  "You Gotta.mp3",
  "You Missed It.mp3",
  "Youth Club.mp3",
];

// Generate tracks from filenames
export const LOCAL_TRACKS: LocalTrack[] = LOCAL_TRACK_FILENAMES.map((filename) => {
  const category = categorizeTrack(filename);
  const name = filename
    .replace('.mp3', '')
    .replace(/^\d+m\d+s\s*/, '') // Remove duration prefix
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: generateId(filename),
    name: name || filename.replace('.mp3', ''),
    filename,
    genre: category.genre,
    mood: category.mood,
    duration: parseDuration(filename),
    tags: category.tags,
    audioUrl: localAudio(filename),
    source: 'local' as const,
  };
});

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getLocalTracksByGenre = (genre: MusicGenreType): LocalTrack[] => {
  return LOCAL_TRACKS.filter(track => track.genre === genre);
};

export const getLocalTracksByMood = (mood: string): LocalTrack[] => {
  return LOCAL_TRACKS.filter(track => track.mood.toLowerCase().includes(mood.toLowerCase()));
};

export const searchLocalTracks = (query: string): LocalTrack[] => {
  const lowerQuery = query.toLowerCase();
  return LOCAL_TRACKS.filter(track =>
    track.name.toLowerCase().includes(lowerQuery) ||
    track.genre.toLowerCase().includes(lowerQuery) ||
    track.mood.toLowerCase().includes(lowerQuery) ||
    track.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getLocalTrackById = (id: string): LocalTrack | undefined => {
  return LOCAL_TRACKS.find(track => track.id === id);
};

export const getRandomLocalTrack = (genre?: MusicGenreType): LocalTrack => {
  const tracks = genre ? getLocalTracksByGenre(genre) : LOCAL_TRACKS;
  return tracks[Math.floor(Math.random() * tracks.length)];
};

export const getShortTracks = (maxDuration: number = 60): LocalTrack[] => {
  return LOCAL_TRACKS.filter(track => track.duration <= maxDuration);
};

export const getLongTracks = (minDuration: number = 180): LocalTrack[] => {
  return LOCAL_TRACKS.filter(track => track.duration >= minDuration);
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIBRARY STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export const LOCAL_LIBRARY_STATS = {
  totalTracks: LOCAL_TRACKS.length,
  genreCounts: LOCAL_TRACKS.reduce((acc, track) => {
    acc[track.genre] = (acc[track.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  shortTracks: LOCAL_TRACKS.filter(t => t.duration < 60).length,
  mediumTracks: LOCAL_TRACKS.filter(t => t.duration >= 60 && t.duration < 180).length,
  longTracks: LOCAL_TRACKS.filter(t => t.duration >= 180).length,
};

export default LOCAL_TRACKS;
