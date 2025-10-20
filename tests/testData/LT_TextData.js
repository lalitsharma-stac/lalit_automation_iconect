/**
 * Test data for LT FIELD1 mass edit operations
 */

module.exports = {
  // Text to replace in LT FIELD1 during mass edit
  replacementText: `As fears of a nuclear apocalypse and World War 3 abound, some prospective homebuyers in the US may want to reconsider the locations they're looking for property in. 'In the event of nuclear war the location of your home can determine your chances for survival,' Andrew Ragusa, who is the CEO of REMI Realty on Long Island, New York, told the Daily Mail.    'What used to be important when purchasing a home such as great school district, close to shopping, and near public transportation, has now changed to warm climate, access to food, and access to water.'    Parts of California, Florida and Texas that are away from their big cities likeSan Francisco, Miami and Houston are ideal because they are near water and have good weather. 'If you're near water you will always be near food and water that can be ingested after it has been desalinated,' said Ragusa. The broker also advised on buying homes in states along the Mississippi River including Arkansas, Illinois, Iowa, Kentucky, Louisiana, Minnesota, Mississippi, Missouri, Tennessee and Wisconsin.  Russia escalated nuclear threats in the midst of its war on Ukraine. North Korea's nuclear arsenal has also been growing. Last week, were elevated as the Doomsday Clock was set at 90 seconds to midnight and the threat of nuclear catastrophe had 'never been so great'.  Another real estate expert, Agent Editorial Board chair Jasen Edwards, suggested the Midwest and southeast due to their access to fresh water and farmland, and the Rocky Mountains which are difficult for nuclear warheads to reach. The elevation of the Rocky Mountains means that fallout would be dispersed more quickly and assisted by higher winds, which could help to minimize any radioactive material reaching the area,' Edwards told the Daily Mail.   Get your need-to-know latest news, feel-good stories, analysis   Of course, not all code words indicate an emergency. Cruise lines use others for smaller concerns. The goal is to avoid alarming guests,  ensuring passengers on the cruise lines have the most relaxing atmosphere possible.     So before anyone steps foot on the ship, cruise personnel receive intensive training      that often includes learning their own lingo and special code words. These drills show a certain level of competency that is mandated across all cruise ships, says travel advisor Janet Semenova.     canada's big role in war of ukraine. Hearing Bravo, Bravo, Bravo on a ship can, after all, point to a serious issue Charlie, Charlie, Charlie: There's an onboard security threat Echo: The ship is starting to drift. That's not something you want to hear, whether you are on a transcontinental cruise     9849876     robbymook@gmail.com      Hillary Clinton     John Podesta     Senate Intel`,
  
  // Expected text for validation (first part of replacement text)
  expectedTextStart: 'As fears of a nuclear apocalypse and World War 3 abound, some prospective homebuyers in the US',
  
  // Search queries to test
  searchQueries: [
    "hillary within 'LT FIELD1'",
    "9849876 within 'LT FIELD1'",
    "senate OR intel within 'LT FIELD1'"
  ],
  
  // Expected record counts
  expectedRecordCount: 179
};
