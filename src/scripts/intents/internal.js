function elevatorPitch(channelID, userID){
    const pitch = `>>>Raconteur specialises in producing content for business decision-makers across print, web and video. \n\nWe're most famous for publishing special report content in _The Times_ and _The Sunday Times_ in print and online, but we also have a rapidly growing Custom Publishing arm which produces bespoke thought leadership and research for some of the world's biggest B2B brands, such as KPMG and Google.\n\nWithin 60 days we can formulate your strategy, produce your content, and position you as a real thought leader to over a million readers through our platforms.\n\n:sunglasses:`;

    bot.postMessage(channelID, pitch);
}

function wifiCode(channelID, userID) {
    const code = `<@${userID}>` + "The main Raconteur WiFi password is: ```R@c0nteurW1F1```\nThe guest WiFi password is: ```Guest001``` \n :sunglasses:";

    bot.postMessage(channelID, code);



}