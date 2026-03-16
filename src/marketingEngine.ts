export type MarketingResult = {
    hook: string
    facebookAd: string
    googleAd: string
    socialPost: string
    offer: string
  }
  
  export function generateMarketing(jobType: string, city: string): MarketingResult {
  
    const hooks = [
      `Need ${jobType} done in ${city}?`,
      `Homeowners in ${city} are fixing this before winter…`,
      `Most people wait too long to handle ${jobType}.`,
      `If you're in ${city} and need ${jobType}, read this.`,
      `${jobType} problems in ${city}? Here's the fix.`,
    ]
  
    const hook = hooks[Math.floor(Math.random()*hooks.length)]
  
    const offer =
    `Limited time offer for ${city} homeowners:
  
  ✔ Free estimate  
  ✔ Fast scheduling  
  ✔ Professional equipment  
  ✔ Reliable results  
  
  Message now to get your quote.`
  
  
    const facebookAd =
  `${hook}
  
  We help homeowners and property owners in ${city} with professional ${jobType} services.
  
  • Fast estimates
  • Reliable scheduling
  • Experienced operator
  • Fair pricing
  
  Send a message now to get a quote.`
  
  
    const googleAd =
  `${jobType} Services – ${city}
  
  Professional ${jobType} available in ${city}.
  
  ✔ Fast estimates  
  ✔ Reliable service  
  ✔ Local contractor  
  
  Call or message today.`
  
  
    const socialPost =
  `Another ${jobType} project coming up in ${city}.
  
  If you need help with:
  
  • land clearing
  • driveway work
  • excavation
  • fencing
  • grading
  
  Send a message and we can take a look.`
  
    return {
      hook,
      facebookAd,
      googleAd,
      socialPost,
      offer
    }
  }