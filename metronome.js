class Metronome
{
    constructor(tempo = 90)
    {
        this.audioContext = null;
        this.notesInQueue = [];
        this.currentQuarterNote = 0;
        this.tempo = tempo;
        this.lookahead = 25;
        this.scheduleAheadTime = 0.1;
        this.nextNoteTime = 0.0;
        this.isRunning = false;
        this.intervalID = null;
    }

    nextNote()
    {
        var secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += secondsPerBeat; //Add beat lenght to the last beat

        this.currentQuarterNote++; // Advance to the beat number, wrap to zero
        if (this.currentQuarterNote == 4) {
            this.currentQuarterNote = 0;
        }
    }

    scheduleNote(beatNumber, time)
    {
        //push the note on the queue, even if not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });
        
        //create an oscillator
        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.frequency.value = (beatNumber % 4== 0) ? 1000 : 800;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time, + 0.02);

        oscillator.connect(envelope);
        envelope.connect(this.audioContext.destination);

        oscillator.start(time);
        oscillator.stop(time + 0.03);
    }

    scheduler()
    {
        //while there are notes that will need to play before the next interval, schedule them and advance the pointer
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            this.nextNote()
        }
    }

    start()
    {
        if (this.isRunning) return;

        if (this.audioContext == null)
        {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentQuarterNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop()
    {
        this.isRunning = false;

        clearInterval(this.intervalID);
    }

    startStop()
    {
        if (this.isRunning) {
            this.stop();    
        }
        else {
            this.start();
        }
    }
}